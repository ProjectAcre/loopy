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
    var n = nodes.length;
    backgroundColors = []
    labels = []
    nodeData = []
    // For some reason, this simply does not initialize it.
    for (let i = 0; i < n; i++)
    {
        console.log(nodes[i].color);
        backgroundColors.push(nodes[i].backgroundColor);
        labels.push(nodes[i].label);
        nodeData.push(nodes[i].value);
    }
   
    self.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: []
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    self.draw = function() {
        currentLabels = []
        currentData = []
        nodeColors = []
        var n = nodes.length;
        if(n==0) return;
        // Force initialize here, because initialization doesn't want to work properly
        // Has the benefit of adapting to erased nodes
        if(n != self.chart.data.datasets.length)
        {
            self.chart.data.datasets = [];
            for (let i = 0; i < n; i++)
            {
                self.chart.data.datasets.push({
                    label: nodes[i].label,
                    data: [{x: 1, y: 59}, {x: 2, y: 81}, { x: 3, y : 55}],
                    borderColor: nodes[i].color,
                    backgroundColor: nodes[i].color,
                    borderWidth: 1
                });
            }
        }
        for (let i = 0; i < n; i++)
        {          
            self.chart.data.datasets[i].label = nodes[i].label; // Continually update label for renaming
            self.chart.data.datasets[i].fillColor = nodes[i].color; // Update color as well
            self.chart.data.datasets[i].borderColor = nodes[i].color;
            self.chart.data.datasets[i].data.push(nodes[i].value);
        }

        self.chart.update();
    };
};
