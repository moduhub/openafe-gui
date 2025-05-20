import { useState, useEffect } from 'react'
import { Box } from '@mui/material'

import { 
  ChartComponent,
  TabArduino, 
  TabDataset, 
  //InterpolationDialog
  PointsSelectedDialog,
} from '../../shared/components'

import { 
  useDashboardContext 
} from '../../shared/contexts'

/**
 * Dashboard component that manages the main layout and interactions for data visualization and device control
 * 
 * Features:
 * - Displays a chart area for visualizing data
 * - Provides UI tabs for Arduino controls and dataset management
 * - Handles interpolation dialog opening based on user-selected points
 * - Automatically minimizes side panels when two points are selected on the chart
 * 
 * State:
 * - `previewData`: Holds the x and y data to display in the chart
 * - `selectedPoints`: Stores points selected by the user on the chart
 * - `openDialog`: Controls visibility of the interpolation dialog
 * 
 * Context:
 * - Uses `useDashboardContext()` for tab minimization state and toggle handlers
 * 
 * Components:
 * - `TabArduino`: Sidebar for Arduino-related controls
 * - `ChartComponent`: Graphical data display
 * - `TabDataset`: Sidebar for dataset control and previewing
 * - `InterpolationDialog`: Modal dialog for handling selected data point interpolation
 */
export const Dashboard = () => {

  let type_chart_dashboard = {
    top : '64px',
    height : 'calc(100% - 64px)',
    width : '100%'
  }

  const {
    tabArduinoIsMinimized, handleToggleTabArduinoMinimized,
    tabDatasetsIsMinimized, handleToggleTabDatasetsMinimized
  } = useDashboardContext()

  const [previewData, setPreviewData] = useState({ x: [], y: [] })
  const [selectedPoints, setSelectedPoints] = useState([])
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    if (selectedPoints.length == 2 && !openDialog) {
      setOpenDialog(true)
      if(!tabArduinoIsMinimized) handleToggleTabArduinoMinimized()
      if(!tabDatasetsIsMinimized) handleToggleTabDatasetsMinimized()
    }
  }, [selectedPoints])

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedPoints([]) 
  }

  return (
    <>
    <PointsSelectedDialog 
      open={openDialog}
      onClose={handleCloseDialog}
      selectedPoints={selectedPoints}
    />

    <Box 
      height="100%" width="100%" 
      display="flex" flexDirection="column"
    >
      <TabArduino />

      <ChartComponent 
        type_={type_chart_dashboard} 
        previewData={previewData}
        setSelectedPoints={setSelectedPoints}
        selectedPoints={selectedPoints}
      />

      <TabDataset 
        setPreviewData={setPreviewData}
        previewData={previewData} 
      />
    </Box>
    </>
  )
}