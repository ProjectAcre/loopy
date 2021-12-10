/**********************************

TOOLBAR CODE

**********************************/

function Toolbar(loopy){

	var self = this;

	// Tools & Buttons
	var buttons = [];
	var buttonsByID = {};
	self.dom = document.getElementById("toolbar");
	self.templatesBar = document.getElementById("templatesbar"); // What even is a "dom"?
	self.dom.appendChild(self.templatesBar);
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
			self.openTemplates();
		}
	})
	totalTemplates = 5; // Todo: not hard-coded?
	for(let i = 0; i < totalTemplates; i++)
	{
		self.addButton({
			id: "template" + i.toString(),
			tooltip: "TEMPLATE (" + (i+1) + ")",
			callback: function() {
				console.log("I am template " + i);
			}
		},self.templatesBar)
	}
	console.log(self.dom);
	console.log(self.templatesBar);
	// Create template grid
	/*
	var totalTemplates = 9; // Todo: not hard-coded?
	var grid = TemplateGrid(self);
	console.log(grid);
	// grid.buttons = [];
	for(let i = 0; i < totalTemplates; i++)
	{
		// Individual Template button
		id = "template" + i;
		var button = new ToolbarButton(self,{
			id: id,
			icon: "css/icons/"+id+".png",
			tooltip: "Template (" + i + ")",
			callback: function(){console.log("Selected Template " + i);}
		});
		grid.dom.appendChild(button.dom);
		// grid.buttons.push(button); // In case it needs tracking?
	}
	self.dom.appendChild(grid.dom);
	*/
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
	self.openTemplates = function(){
		console.log("Here, we open up a 3x3 grid.");
		// TODO: create 3x3 grid of buttons that are each their own template tool. 
		// Double TODO: somehow link these to the existing templates
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
