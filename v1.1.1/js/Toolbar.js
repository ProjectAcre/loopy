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
	self.templatesBar.style.float = 'right';
	self.templatesBar.clientHeight = 280;
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
		id: "templates",
		tooltip: "TE(M)PLATE",
		callback: function() {
			self.toggleTemplateBar();
		}
	})

	// Iterate all templates
	for(let i = 1; i <= Template.ALL_TEMPLATES.length; i++)
	{
		let associatedTemplate = Template.ALL_TEMPLATES[i - 1];
		let templateTooltip = associatedTemplate.name + " (" + i + ")";
		self.addButton({
			id: "template" + i.toString(),
			tooltip: templateTooltip,
			callback: function() {
				self.setTool("template"); // Sets to TOOL_TEMPLATE for all templates
				self.templatesBar.style.display = 'none'; // Close after clicking or accessing shortcut
				loopy.model.setActiveTemplate(new Template(loopy.model, associatedTemplate.template)); // Create the template tool instance and activate it
			}
		},self.templatesBar)
	}
	self.dom.appendChild(self.templatesBar);

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
