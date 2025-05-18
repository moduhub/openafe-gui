import { useState } from 'react'

import {
  Box,
  Card,
  CardContent,
  useTheme,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material'

import MinimizeIcon from '@mui/icons-material/Minimize'
import DatasetIcon from '@mui/icons-material/Dataset'
import BarChartIcon from '@mui/icons-material/BarChart'

import { 
  useDashboardContext,
  useDatasetsContext
} from '../../contexts'

import {
  TabStorage
} from './TabStorageComponent'
import {
  TabFilter
} from './TabFilterComponent'

/**
 * TabDataset component provides a UI panel for managing datasets and applying filters
 * 
 * Features:
 * - Displays two tabs: one for dataset storage/management and another for filtering data
 * - Controls tab switching and resets preview data accordingly
 * - Calls context functions to control dataset visibility when switching tabs
 * 
 * @param {{ x: any[], y: any[] }} previewData                    - The current preview data to be filtered or displayed.
 * @param {(data: { x: any[], y: any[] }) => void} setPreviewData - Function to update the preview data.
 * 
 * @returns {JSX.Element|null}
 */
export const TabDataset = ({ setPreviewData , previewData }) => {

  const theme = useTheme()
  const{
    tabDatasetsIsMinimized: isMinimized, 
    handleToggleTabDatasetsMinimized: setIsMinimized,
  }= useDashboardContext()
  const{
    datasetSelected,
    showOnlyDataset
  } = useDatasetsContext()
  
  const [tabIndex, setTabIndex] = useState(0)
  const handleTabIndex = (_, newIndex) => {
    if (newIndex !== undefined) {
      setTabIndex(newIndex)
      setPreviewData({ x: [], y: [] })
      if(newIndex == 1) showOnlyDataset(datasetSelected)
    }
    
  }

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
          <Box display="flex" flexDirection="row" width="100%" gap={1} justifyContent="space-between">
            <Box display="flex" alignItems="flex-start">
              <Tabs value={tabIndex} onChange={handleTabIndex} variant="fullWidth">
                <Tab icon={<DatasetIcon size="small" />} value={0} />
                <Tab icon={<BarChartIcon size="small" />} value={1} />
              </Tabs>
            </Box>

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

          {tabIndex === 0 ? 
            <TabStorage 
              setTabIndex={setTabIndex} 
            /> 
            : 
            <TabFilter 
              setPreviewData={setPreviewData} 
              previewData={previewData} 
              setTabIndex={setTabIndex}
            />}
        </CardContent>
      </Card>
    </Box>
  )
}