const title = document.getElementById('title')
let dynamicTitle = "Cycle Voltometry"

const chartData = {
    labels: [], // Ajust X
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
const ctx = document.getElementById('meuGrafico').getContext('2d');

// Crie um gráfico de linha inicial
const meuGrafico = new Chart(ctx, {
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
});

title.addEventListener('input', (e) => {
    const dynamicTitle = e.target.value;
    updateTitle(dynamicTitle);
});

function updateTitle(newText) {
    meuGrafico.options.plugins.title.text = newText;
    meuGrafico.update();
}

function addDataToChart(x, y) {
    chartData.labels.push(x);
    chartData.datasets[0].data.push(y);
    meuGrafico.update();
}

var image = meuGrafico.toBase64Image();

document.getElementById('btn-download').onclick = function() {
    // Trigger the download
    var a = document.createElement('a');
    a.href = meuGrafico.toBase64Image();
    a.download = 'my_file_name.png';
    a.click();
}