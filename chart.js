import { Chart } from 'chart.js';

const valoresX = [];
const valoresY = [];

// Dados para o gráfico
const data = {
    datasets: [{
        label: 'Pontos',
        data: [], // Começa vazio, será preenchido dinamicamente
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
    }]
};

// Opções do gráfico
const options = {
    scales: {
        x: {
            type: 'linear',
            position: 'bottom'
        },
        y: {
            min: 0
        }
    }
};

// Obtém o contexto do canvas
const ctx = document.getElementById('myChart').getContext('2d');

// Cria o gráfico de dispersão
const myChart = new Chart(ctx, {
    type: 'scatter',
    data: data,
    options: options
});


function adicionarPonto(x, y) {
    valoresX.push(x);
    valoresY.push(y);

 
    if (valoresX.length > 50) {
        valoresX.shift();
        valoresY.shift();
    }


    myChart.data.datasets[0].data = valoresX.map((x, i) => ({ x, y: valoresY[i] }));
    myChart.update();
}


document.addEventListener('dadosRecebidos', function (e) {
    const x = parseFloat(e.detail.x); 
    const y = parseFloat(e.detail.y);
    adicionarPonto(x, y);
});
