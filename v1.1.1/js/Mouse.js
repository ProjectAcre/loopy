window.Mouse = {};

Mouse.LEFT = 0;
Mouse.RIGHT = 2;
Mouse.init = function(target){

	// Events!
	var _onmousedown = function(event){
		if(event.button == Mouse.LEFT) { 
			Mouse.moved = false;
			Mouse.pressed = true;
			Mouse.startedOnTarget = true;
			publish("mousedown");
		} else if (event.button == Mouse.RIGHT) {
			Mouse.movedRight = false;
			Mouse.pressedRight = true;
			Mouse.startedOnTargetRight = true;
			publish("rightmousedown");
		}
	};
	var _onmousemove = function(event){

		// DO THE INVERSE
		var canvasses = document.getElementById("canvasses");
		var tx = 0;
		var ty = 0;
		var s = 1/loopy.offsetScale;
		var CW = canvasses.clientWidth - _PADDING - _PADDING;
		var CH = canvasses.clientHeight - _PADDING_BOTTOM - _PADDING;

		if(loopy.embedded){
			tx -= _PADDING/2; // dunno why but this is needed
			ty -= _PADDING/2; // dunno why but this is needed
		}
		
		tx -= (CW+_PADDING)/2;
		ty -= (CH+_PADDING)/2;
		
		tx = s*tx;
		ty = s*ty;

		tx += (CW+_PADDING)/2;
		ty += (CH+_PADDING)/2;

		tx -= loopy.offsetX;
		ty -= loopy.offsetY;

		// Mutliply by Mouse vector
		var mx = event.x*s + tx;
		var my = event.y*s + ty;

		// Mouse!
		Mouse.x = mx;
		Mouse.y = my;

		Mouse.moved = true;
		Mouse.movedRight = true;
		publish("mousemove");

	};
	var _onmouseup = function(event){
		if(event.button == Mouse.LEFT) { 
			Mouse.pressed = false;
			if(Mouse.startedOnTarget){
				publish("mouseup");
				if(!Mouse.moved) publish("mouseclick");
			}
			Mouse.moved = false;
			Mouse.startedOnTarget = false;
		} else if (event.button == Mouse.RIGHT) {
			Mouse.pressedRight = false;
			if(Mouse.startedOnTargetRight){
				publish("rightmouseup");
				if(!Mouse.movedRight) publish("rightmouseclick");
			}
			Mouse.movedRight = false;
			Mouse.startedOnTargetRight = false;
		}
	};

	// Add mouse & touch events!
	_addMouseEvents(target, _onmousedown, _onmousemove, _onmouseup);

	// Cursor & Update
	Mouse.target = target;
	Mouse.showCursor = function(cursor){
		Mouse.target.style.cursor = cursor;
	};
	Mouse.update = function(){
		Mouse.showCursor("");
	};

};