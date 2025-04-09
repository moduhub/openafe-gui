import { useState } from 'react';

import {
  Box,
  Card,
  CardContent,
  useTheme,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';

import { FixedSizeList } from 'react-window';

import MinimizeIcon from '@mui/icons-material/Minimize';
import DatasetIcon from '@mui/icons-material/Dataset';
import BarChartIcon from '@mui/icons-material/BarChart';
//import AnalyticsIcon from '@mui/icons-material/Analytics';

import { 
  useDatasetsContext,
  useDashboardContext,
} from '../../contexts'

import {
  TabStorage
} from './TabStorage'
import {
  TabFilter
} from './TabFilter'

export const TabDataset = () => {

  const theme = useTheme();
  const{
    tabDatasetsIsMinimized: isMinimized, 
    handleToggleTabDatasetsMinimized: setIsMinimized,
  }= useDashboardContext()
  
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabIndex = (_, newIndex) => {
    if (newIndex !== undefined) {
      setTabIndex(newIndex);
    }
  };

  if (isMinimized) return null

  return (
    <Box 
      width={theme.spacing(35)}  
      display="flex"     
      flexShrink="0"
      marginTop={theme.spacing(2)}  
      marginBottom={theme.spacing(2)}
      transition="width 0.3s ease"
      alignItems="start"
      justifyContent="end"
      position="absolute"
      top={theme.spacing(16)}
      right={0}
      zIndex={2}
    >
      <Card 
        sx={{
          borderRadius: "16px",
          backgroundColor: theme.palette.background.paper,
          boxShadow: `0 2px 10px rgba(0, 0, 0, 0.2)`,
          border: "1px solid rgba(0, 0, 0, 0.12)"
        }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', color: theme.palette.text.primary }}>
          {/* Controle superior */}
          <Box display="flex" flexDirection="row" width="100%" gap={1} justifyContent="space-between">
            {/* Box para os Tabs, alinhados na parte inferior */}
            <Box display="flex" alignItems="flex-start">
              <Tabs value={tabIndex} onChange={handleTabIndex} variant="fullWidth">
                <Tab icon={<DatasetIcon size="small" />} value={0} />
                <Tab icon={<BarChartIcon size="small" />} value={1} />
              </Tabs>
            </Box>

            {/* Box para o botão de minimização */}
            <Box display="flex" justifyContent="center" height="50%" width="16px">
              <IconButton 
                aria-label="toggle" 
                size="small" 
                onClick={() => setIsMinimized(true)}
              >
                <MinimizeIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Controle de exibição da guia */}
          {tabIndex === 0 ? <TabStorage /> : <TabFilter />}
        </CardContent>
      </Card>
    </Box>
  )
}