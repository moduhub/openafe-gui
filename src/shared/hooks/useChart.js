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
    font: { size: 14, color: theme.palette.text.primary },
    showlegend: false,
    paper_bgcolor: 'transparent', // Torna o fundo principal transparente
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
    scrollZoom: true,
    displaylogo: false,
    displayModeBar: true, // Barra de funções do gráfico
    responsive: false,
    modeBarButtonsToAdd: [
      {
        name: 'Clear Chart',
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