/**********************************

TOOLBAR CODE

**********************************/

function Toolbar(loopy){

	var self = this;

	// Tools & Buttons
	var buttons = [];
	var buttonsByID = {};
	self.dom = document.getElementById("toolbar");
	self.templatesBar = document.createElement("div"); // What even is a "dom"?
	self.templatesBar.style.display = 'none'; // Templates toolbar should not be visible by default
	self.addButton = function(options, dom = self.dom){

		var id = options.id;
		var tooltip = options.tooltip;
		var callback = options.callback;

		// Add the button
		var button = new ToolbarButton(self,{
			id: id,
			icon: "css/icons/"+id+".png",
			tooltip: tooltip,
			callback: callback
		});
		dom.appendChild(button.dom);
		buttons.push(button);
		buttonsByID[id] = button;

		// Keyboard shortcut!
		(function(id){
			subscribe("key/"+id,function(){
				loopy.ink.reset(); // also CLEAR INK CANVAS
				buttonsByID[id].callback();
			});
		})(id);

	};

	// Select button
	self.selectButton = function(button){
		for(var i=0;i<buttons.length;i++){
			buttons[i].deselect();
		}
		button.select();
	};

	// Set Tool
	self.currentTool = "ink";
	self.setTool = function(tool){
		self.currentTool = tool;
		var name = "TOOL_"+tool.toUpperCase();
		loopy.tool = Loopy[name];
		document.getElementById("canvasses").setAttribute("cursor",tool);
	};

	// Populate those buttons!
	self.addButton({
		id: "ink",
		tooltip: "PE(N)CIL",
		callback: function(){
			self.setTool("ink");
		}
	});
	self.addButton({
		id: "label",
		tooltip: "(T)EXT",
		callback: function(){
			self.setTool("label");
		}
	});
	self.addButton({
		id: "drag",
		tooltip: "MO(V)E",
		callback: function(){
			self.setTool("drag");
		}
	});
	self.addButton({
		id: "erase",
		tooltip: "(E)RASE",
		callback: function(){
			self.setTool("erase");
		}
	});
	self.addButton({
		id: "template",
		tooltip: "TE(M)PLATE",
		callback: function() {
			self.toggleTemplateBar();
		}
	})
	totalTemplates = 5; // Todo: not hard-coded?
	for(let i = 0; i < totalTemplates; i++)
	{
		index = i+1; // If these templates correlate to number keys, better to start counting from 1.
		id ="template" + index.toString()
		self.addButton({
			id: id,
			tooltip: "TEMPLATE (" + index + ")",
			callback: function() {
				self.setTool(id);
				self.toggleTemplateBar(); // Close after clicking
			}
		},self.templatesBar)
	}
	self.dom.appendChild(self.templatesBar);

	self.addButton = function(options){

		var id = options.id;
		var tooltip = options.tooltip;
		var callback = options.callback;

		// Add the button
		var button = new ToolbarButton(self,{
			id: id,
			icon: "css/icons/"+id+".png",
			tooltip: tooltip,
			callback: callback
		});
		self.dom.appendChild(button.dom);
		buttons.push(button);
		buttonsByID[id] = button;

		// Keyboard shortcut!
		(function(id){
			subscribe("key/"+id,function(){
				loopy.ink.reset(); // also CLEAR INK CANVAS
				buttonsByID[id].callback();
			});
		})(id);

	};

	// Open templates
	self.toggleTemplateBar = function(){
		// If hidden, show
		if(self.templatesBar.style.display == 'none')
		{
			self.templatesBar.style.display = 'block';
		}
		else // If showing, hide.
		{
			self.templatesBar.style.display = 'none';
		}

	};


	// Select button
	buttonsByID.ink.callback();

	// Hide & Show

}

function ToolbarButton(toolbar, config){

	var self = this;
	self.id = config.id;

	// Icon
	self.dom = document.createElement("div");
	self.dom.setAttribute("class", "toolbar_button");
	self.dom.style.backgroundImage = "url('"+config.icon+"')";

	// Tooltip!
	self.dom.setAttribute("data-balloon", config.tooltip);
	self.dom.setAttribute("data-balloon-pos", "right");

	// Selected?
	self.select = function(){
		self.dom.setAttribute("selected", "yes");
	};
	self.deselect = function(){
		self.dom.setAttribute("selected", "no");
	};

	// On Click
	self.callback = function(){
		config.callback();
		toolbar.selectButton(self);
	};
	self.dom.onclick = self.callback;

}

function TemplateGrid(toolbar){
	// Localized "self" variable
	var self = this;

	self.dom = document.createElement("div");
}
