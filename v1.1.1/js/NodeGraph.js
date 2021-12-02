/**********************************

NODE GRAPHING!

**********************************/

function NodeGraph(model) {
    var self = this;
    self.loopy = model.loopy;
    self.model = model;

    var canvas = _createCanvas('NodeGraph', 300, 200, 'graph_canvas');
    const ctx = canvas.getContext('2d');

    // Get information from nodes
    var nodes = model.nodes;
    var n = nodes.length;
    backgroundColors = []
    labels = []
    data = []
    for (let i = 0; i < n; i++)
    {
        console.log(nodes[i].color);
        backgroundColors.push(nodes[i].backgroundColor);
        labels.push(nodes[i].label);
        data.push(nodes[i].value);
    }
   
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Value',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
