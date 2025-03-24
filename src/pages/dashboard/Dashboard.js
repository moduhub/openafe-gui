import { Box } from '@mui/material';

import { ChartComponent, TabArduino, TabDataset } from '../../shared/components';

import { useState } from 'react';

export const Dashboard = () => {

  // Can be 'small' or 'larger'
  const [graphWidth, setGraphWidth] = useState('100%');

  return (
    <Box 
      height="100%" width="100%" 
      display="flex" flexDirection="row" justifyContent="space-between" alignItems="center"
    >
      {/* Menu lateral */}
      <TabArduino />

      {/* Gráfico */}
      <Box width={graphWidth} height="100%">
        <ChartComponent />
      </Box>

      {/* Controle de Datasets */}
      <TabDataset />
      
    </Box>
  );
};