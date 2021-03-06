/**********************************

TEMPLATE CODE

**********************************/

Template.POSTIVE_EDGE_TEMPLATE = {
	nodes: [{x: -80, init: 1, label: "something", hue: 4}, {x: 80, init: 1, label: "something else", hue: 5}],
	edges: [{from: 1, to: 2, arc: 89, strength: 1}],
	labels: [],
}

Template.OSCILLATING_LOOP_TEMPLATE = {
	nodes: [{x: -80, init: 1, label: "something", hue: 4}, {x: 80, init: 1, label: "something else", hue: 5}],
	edges: [{from: 2, to: 1, arc: 94, strength: -1}, {from: 1, to: 2, arc: 89, strength: 1}],
	labels: [],
}

Template.POSITIVE_FEEDBACK_TEMPLATE = {
	nodes: [{x: -80, init: 1, label: "something", hue: 4}, {x: 80, init: 1, label: "something else", hue: 5}],
	edges: [{from: 2, to: 1, arc: 94, strength: 1}, {from: 1, to: 2, arc: 89, strength: 1}],
	labels: [],
}

Template.START_TEMPLATE = {
	nodes: [{y: 0, init: 1, label: "start", hue: 4}, {y: 160, x: -120, init: 1, label: "system 1", hue: 5}, {y: 160, x: 120, init: 1, label: "system 2", hue: 5}],
	edges: [{from: 1, to: 2, arc: -1, strength: 1}, {from: 1, to: 3, arc: 1, strength: 1}],
	labels: [{y: -70, text: "Click to start!"}],
}

Template.NEGATIVE_TEMPLATE = {
	nodes: [{x: -80, init: 1, label: "something", hue: 4}, {x: 80, init: 1, label: "something else", hue: 5}],
	edges: [{from: 2, to: 1, arc: 94, strength: -1}, {from: 1, to: 2, arc: 89, strength: -1}],
	labels: [],
}

// Create array of all templates. Need corresponding numbered images in css/icons for toolbar
Template.ALL_TEMPLATES = [{name: "Resource Sink", template: Template.POSTIVE_EDGE_TEMPLATE},
						  {name: "Balancing Feedback Loop", template: Template.OSCILLATING_LOOP_TEMPLATE}, 
						  {name: "Positive Feedback Loop", template: Template.POSITIVE_FEEDBACK_TEMPLATE}, 
						  {name: "Multi-System Initializer", template: Template.START_TEMPLATE}, 
						  {name: "Repressilator", template: Template.NEGATIVE_TEMPLATE},
						 ];


function Template(model, prototype) {
	var self = this;
	self._CLASS_ = "Template";

	self.loopy = model.loopy;
	self.model = model;

	self.labels = [];
	self.edges = [];
	self.nodes = [];

	// Create model that extends real model for edges
	var modelCopy = Object.assign({}, model);
	modelCopy.getNode = function(id) {
		return self.nodes[id-1];	
	}

	// Load template from prototype
	for (var i = 0; i < prototype.nodes.length; i++) self.nodes.push(new Node(model, Object.assign({}, prototype.nodes[i])));
	for (var i = 0; i < prototype.edges.length; i++) self.edges.push(new Edge(modelCopy, Object.assign({}, prototype.edges[i])));
	for (var i = 0; i < prototype.labels.length; i++) self.labels.push(new Label(model, Object.assign({}, prototype.labels[i])));

	// MOUSE.
	var _listenerMouseUp = subscribe("mouseup", function() {
		if(self.loopy.mode!=Loopy.MODE_EDIT) return;
		if(self.loopy.tool!=Loopy.TOOL_TEMPLATE) return;

		// Apply to actual model
		self.applyTemplate();

		// Do cleanup
		self.cleanupTool();
	});

	var _listenerCancel = subscribe("key/cancel", function () {
		self.cleanupTool();
	});

	self.applyTemplate = function() {	
		// Apply all template components to graph from prototype

		// Keep track of nodes generated in model
		var generatedNodes = [];

		// Nodes
		for (var i = 0; i < prototype.nodes.length; i++) {
			// Create copy of the object
			var node = Object.assign({}, prototype.nodes[i]);

			// Offset based on selected position
			node.x = Mouse.x + (node.x || 0);
			node.y = Mouse.y + (node.y || 0);
			generatedNodes.push(self.model.addNode(node));
		}


		// Edges
		for (var i = 0; i < prototype.edges.length; i++) {
			// Create copy of the object
			var edge = Object.assign({}, prototype.edges[i]);

			// Re-link edges to corresponding nodes in real graph
			edge.from = generatedNodes[edge.from - 1].id
			edge.to = generatedNodes[edge.to - 1].id

			self.model.addEdge(edge);
		}

		// Labels
		for (var i = 0; i < prototype.labels.length; i++) {
			// Create copy of the object
			var label = Object.assign({}, prototype.labels[i]);

			// Offset based on selected position
			label.x = Mouse.x + (label.x || 0);
			label.y = Mouse.y + (label.y || 0);
			self.model.addLabel(label);
		}

	};

	self.cleanupTool = function() {
		// Remove self
		self.kill();

		// Switch to default tool
		self.loopy.toolbar.selectDefault();
	}


	//////////////////////////////////////
	// UPDATE & DRAW /////////////////////
	//////////////////////////////////////
	
	// Update
	self.update = function(speed) {
		if(self.loopy.mode!=Loopy.MODE_EDIT) return;
		if(self.loopy.tool!=Loopy.TOOL_TEMPLATE) return;

		// Update all edges then nodes
		for (var i = 0; i < self.edges.length; i++) self.edges[i].update(speed);
		for (var i = 0; i < self.nodes.length; i++) self.nodes[i].update(speed);
	}

	// Draw
	var _circleRadius = 0;
	self.draw = function(ctx) {
		if(self.loopy.mode!=Loopy.MODE_EDIT) return;
		if(self.loopy.tool!=Loopy.TOOL_TEMPLATE) return;
		
		// Save context
		ctx.save();

		// Apply translation to mouse position
		ctx.translate(Mouse.x * 2, Mouse.y * 2);

		// Draw labels THEN edges THEN nodes from template
		for (var i = 0; i < self.labels.length; i++) self.labels[i].draw(ctx);
		for (var i = 0; i < self.edges.length; i++) self.edges[i].draw(ctx);
		for (var i = 0; i < self.nodes.length; i++) self.nodes[i].draw(ctx);

		// Restore
		ctx.restore();

	};

	//////////////////////////////////////
	// KILL TEMPLATE /////////////////////
	//////////////////////////////////////

	self.kill = function() {

		// Kill Listeners!
		unsubscribe(_listenerMouseUp);
		unsubscribe(_listenerCancel);

		// Unregister from model
		model.stopTemplate();

		// Killed!
		publish("kill", [self]);
		
		// Force redraw
		publish("mousemove");
	};
}