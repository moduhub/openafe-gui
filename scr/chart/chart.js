const title = document.getElementById('title');
let dynamicTitle = ' ';
let mychart;

const chartData = [{
    x: [],
    y: [],
    mode: 'lines',
    line: {
        color: 'black'
    }
}];

const layout = {
    title: dynamicTitle, // Defina o título diretamente com dynamicTitle
    font: {
        /* family: 'Times New Roman', */
        size: 15,
        weight: 'bold'
    },
    showlegend: false,
    xaxis: {
        title: 'Voltage (mV)',
        linecolor: 'black',
        mirror: true
    },
    yaxis: {
        title: 'Current (uA)',
        linecolor: 'black',
        mirror: true
    },
    modebar: {
        // vertical modebar button layout
        orientation: 'v',
        // for demonstration purposes
      },
};

const config = {
    scrollZoom: true,
    displaylogo: false,
    displayModeBar: true,
    responsive: true,
}

// Função para renderizar o gráfico Plotly
const render = function() {
    mychart = Plotly.newPlot('mychart', chartData, layout, config);
};
render();

// Limpar o gráfico
document.getElementById('btn-clear').onclick = function() {
    chartData[0].x = [];
    chartData[0].y = [];
    updateData();
};

title.addEventListener('input', (e) => {
    dynamicTitle = e.target.value;
    updateTitle(dynamicTitle);
});

// Função para atualizar os dados do gráfico
function updateData() {
    Plotly.update('mychart', chartData, layout);
}

// Função para atualizar o título
function updateTitle(newText) {
    layout.title.text = newText;  // Correção aqui
    Plotly.update('mychart', chartData, layout);
}

// Função para adicionar dados ao gráfico
function addDataToChart(x, y) {
    chartData[0].x.push(x);
    chartData[0].y.push(y);
    updateData();
}

document.getElementById('btn-download').onclick = function() {
    // Baixar o gráfico como imagem
    Plotly.toImage('mychart', { format: 'png' })
        .then(function(url) {
            var a = document.createElement('a');
            a.href = url;
            a.download = 'my_file_name.png';
            a.click();
        });
};
