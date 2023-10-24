const title = document.getElementById('title')
let dynamicTitle = ""
let mychart

const chartData = {
    labels: [],
    datasets: [
        {
            label: "",
            data: [],
            borderWidth: 1,
            borderColor: '#000000',
            fill: false,
            hidden: false
        }
    ]
};

// Obtenha o elemento canvas

// Crie um gráfico de linha inicial
const render = function() {
    const ctx = document.getElementById('mychart').getContext('2d');
    mychart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            animation: {
                duration: 0
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Voltage (mV)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Current (uA)'
                    }
                }
            },
            plugins: {
                zoom: {
                    zoom: {
                    wheel: {
                    enabled: true,
                    },
                    pinch: {
                    enabled: true
                    },
                    mode: 'x',
                }
                },
                title: {
                    display: true,
                    text: dynamicTitle,
                    font: {
                        size: 20,
                        weight: 'bold'
                    },
                    color: "black",
                    padding: {
                        top: 10,
                        bottom: 10,
                    }
                },
                legend: {
                    display: false
                    }
            }
    
        }
    })
};
render()

document.getElementById('btn-clear').onclick = function() {
    chartData.labels = [];
    chartData.datasets[0].data = []; 
    mychart.update(); 
}


title.addEventListener('input', (e) => {
    dynamicTitle = e.target.value;
    updateTitle(dynamicTitle);
});

function updateTitle(newText) {
    mychart.options.plugins.title.text = newText;
    mychart.update();
}

function addDataToChart(x, y) {
    console.log(`Adicionando dados: x=${x}, y=${y}`);
    const chartData = mychart.data;
    const chartLabels = chartData.labels;
    const chartDataArray = chartData.datasets[0].data;

    // Verifique se o valor de x já existe nas labels
    const existingIndex = chartLabels.indexOf(x);

    if (existingIndex !== -1) {
        // Se x já existe, verifique se chartDataArray[existingIndex] é um array
        /* if (!Array.isArray(chartDataArray[existingIndex])) {
            chartDataArray[existingIndex] = [chartDataArray[existingIndex]];
        } */
        // Adicione o novo valor y ao array
        chartDataArray[existingIndex].push(y);
    } else {
        // Se x não existe, crie um novo par de valores
        chartLabels.push(x);
        chartDataArray.push([y]);
        console.log(`Primeiros dados: x=${x}, y=${y}`);
    }

    mychart.data = chartData; // Defina os dados atualizados
    mychart.update();
}




var image = mychart.toBase64Image();

document.getElementById('btn-download').onclick = function() {
    // Trigger the download
    var a = document.createElement('a');
    a.href = mychart.toBase64Image();
    a.download = 'my_file_name.png';
    a.click();
}