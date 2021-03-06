/**********************************

NODE!

**********************************/

Node.COLORS = {
	0: "#EA3E3E", // red
	1: "#EA9D51", // orange
	2: "#FEEE43", // yellow
	3: "#BFEE3F", // green
	4: "#7FD4FF", // blue
	5: "#A97FFF" // purple
};
Node.COLORS_TOL = {
	0: "#332288", // navy
	1: "#117733", // green
	2: "#44AA99", // teal
	3: "#88CCEE", // light blue
	4: "#DDCC77", // yellow
	5: "#CC6677" // red
};
Node.COLORS_WONG = {
	0: "#D55E00", // red-oragne
	1: "#E69F00", // orange
	2: "#F0E442", // yellow
	3: "#009E73", // green
	4: "#56B4E9", // light blue
	5: "#0072B2" // blue
};

Node.COLOR_SETS = {
	0: Node.COLORS,
	1: Node.COLORS_TOL,
	2: Node.COLORS_WONG,
};
Node.defaultValue = 0.5;
Node.defaultHue = 0;
Node.defaultExplodes = false;
Node.defaultPalette = 0;
Node.defaultShape = "circle";
Node.explodedColor = "#808080";
Node.displayDebugText = false;

Node.DEFAULT_RADIUS = 60;

Node.defaultExplodeUpperThreshold = 1;
Node.defaultExplodeLowerThreshold = 0;

function Node(model, config){

	var self = this;
	self._CLASS_ = "Node";

	// Mah Parents!
	self.loopy = model.loopy;
	self.model = model;
	self.config = config;

	// Default values...
	_configureProperties(self, config, {
		id: Node._getUID,
		x: 0,
		y: 0,
		init: Node.defaultValue, // initial value!
		label: "?",
		explodes: Node.defaultExplodes,
		hue: Node.defaultHue,
		palette: Node.defaultPalette,
		shape: Node.defaultShape,
		radius: Node.DEFAULT_RADIUS,
		explodeUpperThreshold: Node.defaultExplodeUpperThreshold,
		explodeLowerThreshold: Node.defaultExplodeLowerThreshold,
		displayDebug: Node.displayDebugText,
		clampedVal: Node.defaultValue
	});

	// Value: from 0 to 1
	self.value = self.init;

	// Init to not exploded
	self.exploded = false;

	// TODO: ACTUALLY VISUALIZE AN INFINITE RANGE
	self.bound = function(){ // bound ONLY when changing value.
		/*var buffer = 1.2;
		if(self.value<-buffer) self.value=-buffer;
		if(self.value>1+buffer) self.value=1+buffer;*/
	};


	// MOUSE.
	var _controlsVisible = false;
	var _controlsAlpha = 0;
	var _controlsDirection = 0;
	var _controlsSelected = false;
	var _controlsPressed = false;	
	var _listenerMouseMove = subscribe("mousemove", function(){

		// ONLY WHEN PLAYING
		if(self.loopy.mode!=Loopy.MODE_PLAY) return;

		// If moused over this, show it, or not.
		_controlsSelected = self.isPointInNode(Mouse.x, Mouse.y);
		if(_controlsSelected){
			_controlsVisible = true;
			self.loopy.showPlayTutorial = false;
			_controlsDirection = (Mouse.y<self.y) ? 1 : -1;
		}else{
			_controlsVisible = false;
			_controlsDirection = 0;
		}

	});
	var _listenerMouseDown = subscribe("mousedown",function(){

		if(self.loopy.mode!=Loopy.MODE_PLAY) return; // ONLY WHEN PLAYING
		if(_controlsSelected) _controlsPressed = true;

		// IF YOU CLICKED ME...
		if(_controlsPressed){

			// Change my value
			var delta = _controlsDirection*0.33; // HACK: hard-coded 0.33

			// Only change value and propogate if not exploded
			if(!self.exploded) {
				self.value += delta;

				self.sendSignal({
					delta: delta
				});
			}

			// Explode if exceeds limit
			if(self.shouldExplode()) {
				self.exploded = true;
			}
		}

	});
	var _listenerMouseUp = subscribe("mouseup",function(){
		if(self.loopy.mode!=Loopy.MODE_PLAY) return; // ONLY WHEN PLAYING
		_controlsPressed = false;
	});
	var _listenerReset = subscribe("model/reset", function(){
		self.value = self.init;
		self.exploded = false;
	});
	var _listenerDebugToggle = subscribe("debug/toggle", function(){
		self.displayDebug = !self.displayDebug;
		publish("mousemove")	// To force a page redraw, otherwise text will still be visible behind nodes
	});

	//////////////////////////////////////
	// SIGNALS ///////////////////////////
	//////////////////////////////////////

	var shiftIndex = 0;
	self.sendSignal = function(signal){
		var myEdges = self.model.getEdgesByStartNode(self);
		myEdges = _shiftArray(myEdges, shiftIndex);
		shiftIndex = (shiftIndex+1)%myEdges.length;
		for(var i=0; i<myEdges.length; i++){
			myEdges[i].addSignal(signal);
		}
	};

	self.takeSignal = function(signal){

		// Change value if not exploded
		if(!self.exploded) {
			self.value += signal.delta;
		}

		// Explode if exceeded value
		if(self.shouldExplode()) {
			self.exploded = true;
		}

		// Propagate signal if not exploded
		if(!self.exploded) {
			self.sendSignal(signal);
		}

		// self.sendSignal(signal.delta*0.9); // PROPAGATE SLIGHTLY WEAKER

		// Animation
		// _offsetVel += 0.08 * (signal.delta/Math.abs(signal.delta));
		_offsetVel -= 6 * (signal.delta/Math.abs(signal.delta));

	};


	//////////////////////////////////////
	// UPDATE & DRAW /////////////////////
	//////////////////////////////////////

	// Update!
	var _offset = 0;
	var _offsetGoto = 0;
	var _offsetVel = 0;
	var _offsetAcc = 0;
	var _offsetDamp = 0.3;
	var _offsetHookes = 0.8;
	self.update = function(speed){

		// When actually playing the simulation...
		var _isPlaying = (self.loopy.mode==Loopy.MODE_PLAY);

		// Otherwise, value = initValue exactly
		if(self.loopy.mode==Loopy.MODE_EDIT){
			self.value = self.init;
			self.exploded = false;
		}

		// Cursor!
		if(_controlsSelected) Mouse.showCursor("pointer");

		// Keep value within bounds!
		self.bound();

		// Visually & vertically bump the node
		var gotoAlpha = (_controlsVisible || self.loopy.showPlayTutorial) ? 1 : 0;
		_controlsAlpha = _controlsAlpha*0.5 + gotoAlpha*0.5;
		if(_isPlaying && _controlsPressed){
			_offsetGoto = -_controlsDirection*20; // by 20 pixels
			// _offsetGoto = _controlsDirection*0.2; // by scale +/- 0.1
		}else{
			_offsetGoto = 0;
		}
		_offset += _offsetVel;
		if(_offset>40) _offset=40
		if(_offset<-40) _offset=-40;
		_offsetVel += _offsetAcc;
		_offsetVel *= _offsetDamp;
		_offsetAcc = (_offsetGoto-_offset)*_offsetHookes;
	};
	self.shouldExplode = function(){
		return (self.explodes && (self.value > self.explodeUpperThreshold || self.value < self.explodeLowerThreshold));
	}
	// Draw
	var _circleRadius = 0;
	self.draw = function(ctx){
		// Retina
		var x = self.x*2;
		var y = self.y*2;
		var r = self.radius*2;
		self.color = Node.COLOR_SETS[self.palette][self.hue];
		
		// Modify color if exploded
		if(self.exploded) {
			self.color = Node.explodedColor;
		}

		// Translate!
		ctx.save();
		ctx.translate(x,y+_offset);
		
		// DRAW HIGHLIGHT???
		if(self.loopy.sidebar.currentPage.target == self){
			ctx.beginPath();
			ctx.arc(0, 0, r+40, 0, Math.TAU, false);
			ctx.fillStyle = HIGHLIGHT_COLOR;
			ctx.fill();
		}
		
		// White-gray bubble with colored border
		ctx.beginPath();
		ctx.arc(0, 0, r-2, 0, Math.TAU, false);
		ctx.fillStyle = "#fff";
		ctx.fill();
		ctx.lineWidth = 6;
		ctx.strokeStyle = self.color;
		ctx.stroke();
		
		// Circle radius
		// var _circleRadiusGoto = r*(self.value+1);
		// _circleRadius = _circleRadius*0.75 + _circleRadiusGoto*0.25;

		// RADIUS IS (ATAN) of VALUE?!?!?!
		var _r = Math.atan(self.value*5);
		_r = _r/(Math.PI/2);
		_r = (_r+1)/2;

		// INFINITE RANGE FOR RADIUS
		// linear from 0 to 1, asymptotic otherwise.
		var _value;
		if(self.value>=0 && self.value<=1){
			// (0,1) -> (0.1, 0.9)
			_value = 0.1 + 0.8*self.value;
		}else{
			if(self.value<0){
				// asymptotically approach 0, starting at 0.1
				_value = (1/(Math.abs(self.value)+1))*0.1;
			}
			if(self.value>1){
				// asymptotically approach 1, starting at 0.9
				_value = 1 - (1/self.value)*0.1;
			}
		}
		
		self.clampedVal = _value;

		// Colored bubble
		ctx.beginPath();
		var _circleRadiusGoto = r*_value; // radius
		_circleRadius = _circleRadius*0.8 + _circleRadiusGoto*0.2;
		ctx.arc(0, 0, _circleRadius, 0, Math.TAU, false);
		ctx.fillStyle = self.color;
		ctx.fill();

		// Text!
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "#000";
	
		// resize label text
		self.fillSelfSizingText(ctx, r, self.label);
	
		var roundedValue = Math.round(self.value * 100) / 100; // Temp variable solely to cleanly display value
		
		if(self.displayDebug) {
			// resize value text
			self.fillSelfSizingText(ctx, r, roundedValue, 40); // Display value slightly below label.

			// resize explody text
			self.fillSelfSizingText(ctx, r, "" + self.explodes + ", " + self.exploded, 80);
		}

		// WOBBLE CONTROLS
		var cl = 40;
		var cy = 0;
		if(self.loopy.showPlayTutorial && self.loopy.wobbleControls>0){
			var wobble = self.loopy.wobbleControls*(Math.TAU/30);
			cy = Math.abs(Math.sin(wobble))*10;
		}

		// Controls!
		ctx.globalAlpha = _controlsAlpha;
		ctx.strokeStyle = "rgba(0,0,0,0.8)";
		// top arrow
		ctx.beginPath();
		ctx.moveTo(-cl,-cy-cl);
		ctx.lineTo(0,-cy-cl*2);
		ctx.lineTo(cl,-cy-cl);
		ctx.lineWidth = (_controlsDirection>0) ? 10: 3;
		if(self.loopy.showPlayTutorial) ctx.lineWidth=6;
		ctx.stroke();
		// bottom arrow
		ctx.beginPath();
		ctx.moveTo(-cl,cy+cl);
		ctx.lineTo(0,cy+cl*2);
		ctx.lineTo(cl,cy+cl);
		ctx.lineWidth = (_controlsDirection<0) ? 10: 3;
		if(self.loopy.showPlayTutorial) ctx.lineWidth=6;
		ctx.stroke();

		// Restore
		ctx.restore();

	};

	self.fillSelfSizingText = function(ctx, r, text, y_displacement = 0) {
		var fontsize = 40;
		ctx.font = "normal "+fontsize+"px sans-serif";
		var textWidth = ctx.measureText(text).width;
		while(textWidth > r*2 - 30){ // -30 for buffer. HACK: HARD-CODED. //WHY?!??!
			fontsize -= 1;
			ctx.font = "normal "+fontsize+"px sans-serif";
			textWidth = ctx.measureText(text).width;
		}
		ctx.fillText(text, 0, y_displacement);
	};

	//////////////////////////////////////
	// KILL NODE /////////////////////////
	//////////////////////////////////////

	self.kill = function(){

		// Kill Listeners!
		unsubscribe("mousemove",_listenerMouseMove);
		unsubscribe("mousedown",_listenerMouseDown);
		unsubscribe("mouseup",_listenerMouseUp);
		unsubscribe("model/reset",_listenerReset);
		unsubscribe("debug/toggle",_listenerDebugToggle);

		// Remove from parent!
		model.removeNode(self);

		// Killed!
		publish("kill",[self]);

	};

	//////////////////////////////////////
	// HELPER METHODS ////////////////////
	//////////////////////////////////////

	self.isPointInNode = function(x, y, buffer){
		buffer = buffer || 0;
		return _isPointInCircle(x, y, self.x, self.y, self.radius+buffer);
	};

	self.getBoundingBox = function(){
		return {
			left: self.x - self.radius,
			top: self.y - self.radius,
			right: self.x + self.radius,
			bottom: self.y + self.radius
		};
	};

}

////////////////////////////
// Unique ID identifiers! //
////////////////////////////

Node._UID = 0;
Node._getUID = function(){
	Node._UID++;
	return Node._UID;
};
