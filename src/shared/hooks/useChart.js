import { useState, useEffect, useContext } from 'react';
import Plotly from 'plotly.js-dist';
import { ThemeContext } from '../contexts/ThemeContext';

export const useChart = () => {
  const { theme } = useContext(ThemeContext);

  const [chartData, setChartData] = useState([{
    x: [],
    y: [],
    mode: 'lines',
    line: { color: theme.palette.primary.main },
  }]);

  const layout = {
    font: { size: 15, color: theme.palette.text.primary },
    showlegend: false,
    paper_bgcolor: theme.palette.background.default,
    plot_bgcolor: theme.palette.background.paper,
    xaxis: { 
      title: 'Voltage (mV)', 
      linecolor: theme.palette.text.primary, 
      mirror: true,
      gridcolor: theme.palette.divider,
      zerolinecolor: theme.palette.divider,
    },
    yaxis: { 
      title: 'Current (uA)', 
      linecolor: theme.palette.text.primary, 
      mirror: true,
      gridcolor: theme.palette.divider,
      zerolinecolor: theme.palette.divider,
    },
    modebar: {
      orientation: 'v',
      bgcolor: theme.palette.background.paper,
      iconColor: theme.palette.primary.main,
      logoColor: theme.palette.secondary.main,
    },
  };

  const config = {
    scrollZoom: false,
    displaylogo: false,
    displayModeBar: false, // Barra de funções do gráfico
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
    setChartData([{ x: [], y: [], mode: 'lines', line: { color: theme.palette.primary.main } }]);
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
  }, [chartData, theme]);

  return { chartData, setChartData, clearChart, addDataToChart };
};