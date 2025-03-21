import { Box } from '@mui/material';

import { ChartComponent } from '../components';
import { ArduinoTab, DatasetTab } from '../components'

import { useState,useEffect } from 'react';

export const LayoutBaseDePagina = ({ children }) => {

  // Can be 'small' or 'larger'
  const [graphWidth, setGraphWidth] = useState('100%');

  return (
    <Box height="100%" width="100%" display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
      
      {/* Menu lateral */}
      <ArduinoTab />

      {/* Gráfico */}
      <Box width={graphWidth} height="100%">
        <ChartComponent />
      </Box>

      {/* Controle de Datasets */}
      
      
    </Box>
  );
};
