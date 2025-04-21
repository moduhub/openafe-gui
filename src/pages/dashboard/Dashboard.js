import { Box } from '@mui/material'

import { 
  ChartComponent,
  TabArduino, 
  TabDataset, 
  TabBottom,
} from '../../shared/components'

export const Dashboard = () => {

  let type_chart_dashboard = {
    top : '64px',
    height : 'calc(100% - 64px)',
    width : '100%'
  }

  return (
    <Box 
      height="100%" width="100%" 
      display="flex" flexDirection="column"
    >
      {/* Menu lateral */}
      <TabArduino />

      {/* Gráfico */}
      <ChartComponent type_={type_chart_dashboard} />

      {/* Controle de Datasets */}
      <TabDataset />
      
    </Box>
  )
}