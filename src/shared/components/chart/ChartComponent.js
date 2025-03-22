import React, { useEffect, useMemo, useContext } from 'react'
import { Box } from '@mui/material';
import Plotly from 'plotly.js-dist';

import { ThemeContext } from '../../contexts';
import { useDatasetsContext } from '../../contexts/datasets-context/DatasetsContext';

export const ChartComponent = () => {
  const { theme } = useContext(ThemeContext)
  const { datasets } = useDatasetsContext()

  // Erro no useMemo Corrigir
  const layout = useMemo(() => ({
    font: { size: 14, color: theme.palette.text.primary },
    showlegend: false,
    paper_bgcolor: 'transparent',
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
  }), [theme]);

  const config = useMemo(() => ({
    scrollZoom: true,
    displaylogo: false,
    displayModeBar: true,
    responsive: false,
  }), [])

  useEffect(() => {
    console.log("Alteração no gráfico")
    const allPoints = datasets.map(dataset => ({
      x: dataset.points.map(point => point.x),
      y: dataset.points.map(point => point.y),
      mode: 'lines',
      line: { color: theme.palette.primary.main },
    }));
    Plotly.newPlot('mychart', allPoints, layout, config)
  }, [datasets, layout, config])

  return (
    <Box id="mychart" sx={{ height: "100%", width: '100%' }}></Box>
  );
};