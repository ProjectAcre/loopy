/**********************************

NODE GRAPHING!

**********************************/

function NodeGraph(model) {
    var self = this;
    self.loopy = model.loopy;
    self.model = model;

    var canvas = _createCanvas('NodeGraph', 1600, 1400, 'graph_canvas');
    const ctx = canvas.getContext('2d');

    // Get information from nodes
    var nodes = model.nodes;
    var n = 0; // number of nodes
    backgroundColors = []
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
                    max: 1
                }
            }
        }
    });
    fps = 30; // The fps that, for some god-forsaken reason, was hard-coded.
    ticks = 0; // Literally the number of frames corresponding to the x axis
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
            for (let i = 0; i < n; i++)
            {     
                self.chart.data.datasets[i].data.push({x: (seconds), y: nodes[i].clampedVal});
            }
         }

        // Less intensive update; can afford to do every frame
        for (let i = 0; i < n; i++)
            {     
                self.chart.data.datasets[i].label = nodes[i].label; // Continually update label for renaming
                self.chart.data.datasets[i].backgroundColor = nodes[i].color; // Update color as well
                self.chart.data.datasets[i].borderColor = nodes[i].color;
            }
        ticks++;
        self.chart.update();
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
                borderWidth: 1
            });
        }
    };
};
