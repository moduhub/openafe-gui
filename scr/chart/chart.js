const title = document.getElementById('title');
let dynamicTitle = ' ';
let mychart;
let data = []

const binIconSVG =  {'width': 500,
'height': 600,
'path': 'M224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64zm215.39-149.71c-19.32-20.76-55.47-51.99-55.47-154.29 0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84C118.56 68.1 64.08 130.3 64.08 208c0 102.3-36.15 133.53-55.47 154.29-6 6.45-8.66 14.16-8.61 21.71.11 16.4 12.98 32 32.1 32h383.8c19.12 0 32-15.6 32.1-32 .05-7.55-2.61-15.27-8.61-21.71z'
}
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
        orientation: 'v',
        bgcolor: 'rgba(255 ,255 ,255 ,0.7)',
        iconColor: 'red',
        logoColor: 'rgba(0, 31, 95, 0.3)',
    },
};

const config = {
    scrollZoom: true,
    displaylogo: false,
    displayModeBar: true,
    responsive: true,
    modeBarButtonsToAdd: [
        {
          name: 'Clear Chart',
          icon: binIconSVG,
          direction: 'up',
          click: function() {    
            chartData[0].x = [];
            chartData[0].y = [];
            updateData();
          }}],

}

// Função para renderizar o gráfico Plotly
const render = function() {
    mychart = Plotly.newPlot('mychart', chartData, layout, config);
};
render();


title.addEventListener('input', (e) => {
    dynamicTitle = e.target.value;
    updateTitle(dynamicTitle);
});

// Função para atualizar os dados do gráfico
function updateData() {
    Plotly.update('mychart', chartData, layout);
    /* setTimeout(updateData, 500); */
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
    data.push({ x, y });
}

function getPlotterData(){
    const resultValue = data.reduce((result, data) => {
        if(data.y > result.y){
            resultValue.y = data
        }
        if(data.y < result.y){
            resultValue.y = data
        }
        return result
    }, {max: {}, min: {}})
   


    console.log('x:' + resultValue.y, 'y:' + resultValue.y);


/*     const x = plotterData[0].trace.x
    const y = plotterData[0].trace.y
    console.log(x,y) */
}