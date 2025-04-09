import React, { useEffect, useMemo, useContext } from 'react';
import { Box } from '@mui/material';
import Plotly from 'plotly.js-dist';

import {
  ThemeContext,
  useDatasetsContext,
  useDashboardContext,
} from '../../contexts';

export const ChartComponent = () => {
  const { theme } = useContext(ThemeContext);
  const { datasetSelected, datasets } = useDatasetsContext();
  const {
    tabArduinoIsMinimized,
    tabDatasetsIsMinimized,
  } = useDashboardContext();

  const layout = useMemo(() => ({
    font: { size: 14, color: theme.palette.text.primary },
    showlegend: false,
    paper_bgcolor: 'transparent',
    plot_bgcolor: theme.palette.background.paper,
    margin: { l: 30, r: 10, t: 10, b: 20 },
    xaxis: {
      title: 'Voltage (mV)',
      linecolor: theme.palette.text.primary,
      mirror: true,
      gridcolor: theme.palette.divider,
      zerolinecolor: theme.palette.divider,
      automargin: false,
      title_standoff: 0,
    },
    yaxis: {
      title: 'Current (uA)',
      linecolor: theme.palette.text.primary,
      mirror: true,
      gridcolor: theme.palette.divider,
      zerolinecolor: theme.palette.divider,
      automargin: false,
      title_standoff: 0,
    },
  }), [theme]);

  const config = useMemo(() => ({
    scrollZoom: false,
    displaylogo: false,
    displayModeBar: false,
    responsive: false,
  }), []);

  // Constructor
  useEffect(() => {
    const updateChartSize = () => {
      const boxElement = document.getElementById('mychart');
      if (boxElement) {
        const { width, height } = boxElement.getBoundingClientRect();
        Plotly.relayout('mychart', {
          width: Math.floor(width),
          height: Math.floor(height),
        });
      }
    };

    window.addEventListener('resize', updateChartSize);
    // Destructor
    return () => {
      window.removeEventListener('resize', updateChartSize);
    };
  }, []);

  useEffect(() => {
    const datagraph = Object.keys(datasets)
      .map((key, index) => {
        const dataset = datasets[key];
        const data = dataset.data;
        
        if (data && data.length > 0 && data[0].x && data[0].y && dataset.visible) {
          return {
            x: data[0].x,
            y: data[0].y,
            mode: 'lines',
            name: key, 
          };
        }
        return null;
      })
      .filter(item => item !== null); 

    Plotly.newPlot('mychart', datagraph, layout, config);
  }, [datasets, layout, config])

  return (
    <Box
      id="mychart"
      position='absolute'
      flex='1'
      zIndex={0}
      top='64px'
      right={0}
      height='calc(100% - 128px)'
      width='calc(100%)'
    />
  );
};
