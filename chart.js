
const chartData = {
    labels: [],
    datasets: [
        {
            label: 'Valores de y',
            data: [], // Valores de y
            /* borderColor: 'rgba(75, 192, 192, 1)', */
            borderWidth: 1,
            fill: false
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
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Valores de x'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Valores de y'
                }
            }
        }
    }
});

function addDataToChart(x, y) {
    chartData.labels.push(x);
    chartData.datasets[0].data.push(y);
    meuGrafico.update();
}

