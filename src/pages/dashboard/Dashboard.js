import { Box } from '@mui/material';

import { 
  ChartComponent,
  TabArduino, 
  TabDataset 
} from '../../shared/components';

import { useState } from 'react';

export const Dashboard = () => {

  return (
    <Box 
      height="100%" width="100%" 
      display="flex" flexDirection="row" justifyContent="space-between" alignItems="center"
    >
      {/* Menu lateral */}
      <TabArduino />

      {/* Gráfico */}
      <ChartComponent />

      {/* Controle de Datasets */}
      <TabDataset />
      
    </Box>
  );
};