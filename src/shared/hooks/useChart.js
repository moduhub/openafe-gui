import { useState, useEffect } from 'react';
import Plotly from 'plotly.js-dist';

export const useChart = () => {
  const [chartData, setChartData] = useState([{
    x: [],
    y: [],
    mode: 'lines',
    line: { color: 'black' },
  }]);

  const layout = {
    font: { size: 15, weight: 'bold' },
    showlegend: false,
    xaxis: { title: 'Voltage (mV)', linecolor: 'black', mirror: true },
    yaxis: { title: 'Current (uA)', linecolor: 'black', mirror: true },
    modebar: {
      orientation: 'v',
      bgcolor: 'rgba(255, 255, 255, 0.7)',
      iconColor: 'red',
      logoColor: 'rgba(0, 31, 95, 0.3)',
    },
  };

  const config = {
    scrollZoom: false,
    displaylogo: false,
    displayModeBar: false, //Barra de funções do gráfico
    responsive: true,
    modeBarButtonsToAdd: [
      {
        name: 'Clear Chart',
        icon: {
          width: 500,
          height: 600,
          path: 'M224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64z...',
        },
        direction: 'up',
        click: () => clearChart(setChartData),
      },
    ],
  };

  const clearChart = (setChartData) => {
    setChartData([{ x: [], y: [], mode: 'lines', line: { color: 'black' } }]);
  };

  const addDataToChart = (x, y) => {
    setChartData(prevData => {
      const newData = { ...prevData[0] };
      newData.x.push(x);
      newData.y.push(y);
      return [newData];
    });
  };

  useEffect(() => {
    Plotly.newPlot('mychart', chartData, layout, config);
  }, [chartData]);

  return { chartData, setChartData, clearChart, addDataToChart };
};