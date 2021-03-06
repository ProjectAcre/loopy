/**********************************

NODE GRAPHING!

**********************************/

NodeGraph.defaultTimeWindow = 15;  // Seconds
NodeGraph.defaultWidth = 400;   //px
NodeGraph.defaultHeight = 350;  //px

NodeGraph.shapes = {
    "circle" : "● ",
    "triangle" : "▲ ",
    "rect" : "■ ",
    "rectRot" : "◆ ",
    "star" : "* ",
    "cross" : "+ ",
    "crossRot" : "x "
}

function NodeGraph(model) {
    var self = this;
    self.loopy = model.loopy;
    self.model = model;
    self._CLASS_ = "Graph";
    self.timeWindow = NodeGraph.defaultTimeWindow;
    self.graphH = NodeGraph.defaultHeight;
    self.graphW = NodeGraph.defaultWidth;
    self.isDragging = false;
    self.isHidden = false;
    self.parent = 'graph_div';

    var canvas = _createCanvas('NodeGraph', self.graphW, self.graphH, self.parent);
    const ctx = canvas.getContext('2d');

    // Get information from nodes
    var nodes = model.nodes;
    var n = 0; // number of nodes
    backgroundColors = []
    backgroundShapes = []
    labels = []
    nodeData = []
    
   
    self.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: 1,
                    title: {
                        display: true,
                        text: 'Relative Value',
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time (seconds)',
                    }
                }
            },
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    align: 'start',
                    maxWidth: 150,
                }
            }
        },
    });

    fps = 30; // The fps that, for some god-forsaken reason, was hard-coded into loopy.
    ticks = 0; // Literally the number of frames corresponding to the x axis.

    self.draw = function() {
        n = nodes.length;
        if(n==0) return;
        // Force initialize here, because initialization doesn't want to work properly
        // Has the benefit of adapting to erased nodes
        if(n != self.chart.data.datasets.length)
        {
           self.reset();
        }
        // Restrain how rapidly this thing updates! This section will lag the program to death if updated every frame.
        if(ticks % fps == 0){
                
            // Update time marker
            seconds = ticks/fps;
            self.chart.data.labels.push(seconds);

            // Hate that this if statement is repeated but can't think of a better way to handle this immediately
            if(seconds > self.timeWindow)
            {
                // Remove the label corresponding with old data
                self.chart.data.labels.shift();
            }

            for (let i = 0; i < n; i++)
            {   
                // Update data  
                self.chart.data.datasets[i].data.push({x: (seconds), y: nodes[i].clampedVal});
                if(seconds > self.timeWindow)
                {
                    // Remove old data.
                    self.chart.data.datasets[i].data.shift();
                }
                
                self.chart.data.datasets[i].label = NodeGraph.shapes[nodes[i].shape] + nodes[i].label; // Continually update label for renaming
                self.chart.data.datasets[i].backgroundColor = nodes[i].color; // Update color as well
                self.chart.data.datasets[i].borderColor = nodes[i].color;
                self.chart.data.datasets[i].pointStyle = nodes[i].shape;
            }
         }

        ticks++; // Increment ticks for slowed update
        self.chart.update('none'); // Unfortunately, chart has to update without animation to show points scrolling.
    };

    self.reset = function(){
        ticks = 0;
        self.chart.data.labels=[];
        self.chart.data.datasets = [];
        for (let i = 0; i < n; i++)
        {
            self.chart.data.datasets.push({
                label: nodes[i].label,
                data: [],
                borderColor: nodes[i].color,
                backgroundColor: nodes[i].color,
                backgroundShape: nodes[i].shape,
                borderWidth: 1
            });
        }
    };

    var _listenerVisibleToggle = subscribe("graph/toggleVisible", function(){
        var containingDiv = document.getElementById(self.parent);
        if(!self.isHidden)
        {
            self.chart.resize(0,0);
            containingDiv.style.width = 0;
            containingDiv.style.height = 0;
            self.isHidden = true;
        }
        else
        {
            self.chart.resize(NodeGraph.defaultWidth, NodeGraph.defaultHeight);
            containingDiv.style.width = NodeGraph.defaultWidth;
            containingDiv.style.height = NodeGraph.defaultHeight;
            self.isHidden = false;
        }
    });

    var _listenerResize = subscribe("graph/resize", function() {
        self.chart.resize(NodeGraph.defaultWidth, NodeGraph.defaultHeight);
    });

    var _listenerMouseUp = subscribe("mouseup", function() {
        self.isDragging = false;
    });
    
    var _listenerRightMouseUp = subscribe("rightmouseup", function() {
        self.isDragging = false;
    });

    var _listenerChangeColor = subscribe("node/changeColor", function(n) {
        Node.defaultPalette = n;
        for (let i = 0; i < nodes.length; i++){
            nodes[i].palette = n;
            nodes[i].color = Node.COLOR_SETS[nodes[i].palette][nodes[i].hue];
            if(self.chart.data.datasets.length != 0){
                self.chart.data.datasets[i].backgroundColor = nodes[i].color; // Update color as well
                self.chart.data.datasets[i].pointBackgroundColor = nodes[i].color;
                self.chart.data.datasets[i].borderColor = nodes[i].color;
            }
        }
        self.chart.update();
        publish("mousemove");
    });

    self.isPointOnGraph = function(x, y) {
        if(self.isHidden) {
            return false;
        }
        return _isPointInBox(x, y, self.getBounds());
    }

    self.isBeingDragged = function(x,y) {
        if((Mouse.pressed || Mouse.pressedRight)  && self.isPointOnGraph(x,y)) {
            self.isDragging = true;
        }
        return self.isDragging;
    }

    self.getBounds = function() {
        var containingDiv = document.getElementById(self.parent);
        return {
            x: parseInt(containingDiv.style.left, 10),
            y: parseInt(containingDiv.style.top, 10),
            width: self.graphW,
            height: self.graphH
        };
    }
};