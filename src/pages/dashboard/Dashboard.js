import { Box } from '@mui/material';

import { 
  ChartComponent,
  TabArduino, 
  TabDataset, 
  TabBottom,
} from '../../shared/components';

export const Dashboard = () => {

  return (
    <Box 
      height="100%" width="100%" 
      display="flex" flexDirection="column"   
      //justifyContent="space-between" alignItems="center"
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