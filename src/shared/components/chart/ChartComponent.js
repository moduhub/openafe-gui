import React, { useEffect, useMemo, useContext } from 'react'
import { Box } from '@mui/material';
import Plotly from 'plotly.js-dist';

import { ThemeContext } from '../../contexts';
import { useDatasetsContext } from '../../contexts/datasets-context/DatasetsContext';

export const ChartComponent = () => {
  const { theme } = useContext(ThemeContext)
  const { 
    datasetSelected,
    datasets,
  } = useDatasetsContext()

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
    scrollZoom: false,
    displaylogo: false,
    displayModeBar: false,
    responsive: false,
  }), [])

  useEffect(() => {
    let datagraph = (datasets[datasetSelected]!=null) ? 
      datasets[datasetSelected].data : [{ x:[null],y:[null] }]

    Plotly.newPlot('mychart', datagraph , layout, config);
    // Limpeza do gráfico ao desmontar o componente
    //Plotly.purge('mychart');
  }, [datasets, datasetSelected]);

  return (
    <Box id="mychart" sx={{ height: "100%", width: '100%' }}></Box>
  );
};