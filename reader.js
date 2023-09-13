let receivedData = '';

// Inicialize o array de dados para o gráfico
const chartData = {
    labels: [], // Valores de x
    datasets: [
        {
            label: 'Valores de y',
            data: [], // Valores de y
            borderColor: 'rgba(75, 192, 192, 1)',
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

async function readData() {
    try {
        const reader = port.readable.getReader();
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                reader.releaseLock();
                break;
            }
            const textDecoder = new TextDecoder('utf-8');
            const data = textDecoder.decode(value);
            receivedData += data;

            if (receivedData.includes('\n')) {
                const lines = receivedData.split('\n');

                for (const line of lines) {
                    if (line.startsWith("$SGL,")) {
                        const part = line.split(',');
                        const x = parseFloat(part[1]);
                        const y = parseFloat(part[2]);
                        console.log('SGL:' + x);
                        console.log('y:' + y);

                        // Adicione os dados ao gráfico
                        chartData.labels.push(x);
                        chartData.datasets[0].data.push(y);

                        // Atualize o gráfico
                        meuGrafico.update();
                    }
                }

                // Limpe os dados recebidos
                receivedData = '';
            }
        }
    } catch (error) {
        console.error('Erro na leitura:', error);
    }
}

document.getElementById('readDataButton').addEventListener('click', readData);
