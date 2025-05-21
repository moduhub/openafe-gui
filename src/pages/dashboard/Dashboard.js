import { useState } from 'react'
import { Box, Menu, MenuItem } from '@mui/material'

import { 
  ChartComponent,
  TabArduino, 
  TabDataset, 
  AddMarkDialog,
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
  const [contextMenu, setContextMenu] = useState(null)
  const [openMarkDialog, setOpenMarkDialog] = useState(false)

  const handleChartContextMenu = (event) => {
    event.preventDefault()
    if (selectedPoints.length === 1 || selectedPoints.length === 2) {
      setContextMenu({
        mouseX: event.clientX - 2,
        mouseY: event.clientY - 4,
      })
    }
    if (selectedPoints.length === 2) {
      setContextMenu({
        mouseX: event.clientX - 2,
        mouseY: event.clientY - 4,
      })
    }
  }

  const handleOpenDialogFromMenu = (type) => {
    if(type == "markers")
      setOpenMarkDialog(true)
    else
      setOpenDialog(true)

    setContextMenu(null)
    if(!tabArduinoIsMinimized) handleToggleTabArduinoMinimized()
    if(!tabDatasetsIsMinimized) handleToggleTabDatasetsMinimized()
  }

  const handleCloseContextMenu = () => {
    setContextMenu(null)
  }

  const handleClearSelection = () => {
    setSelectedPoints([])
    setContextMenu(null)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setOpenMarkDialog(false)
    setSelectedPoints([]) 
  }

  return (
    <>
    <PointsSelectedDialog 
      open={openDialog}
      onClose={handleCloseDialog}
      selectedPoints={selectedPoints}
    />
    <AddMarkDialog
      open={openMarkDialog}
      onClose={handleCloseDialog}
      point={selectedPoints[0]}
    />

    <Menu
      open={contextMenu !== null}
      onClose={handleCloseContextMenu}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
    >
      {selectedPoints.length === 1 && (
        <MenuItem onClick={() => handleOpenDialogFromMenu("markers")}>
          Add Markup
        </MenuItem>
      )}
      {selectedPoints.length === 2 && (
        <Box>
          <MenuItem onClick={() => handleOpenDialogFromMenu("interpolation-area")}>
            New Interpolation / Calculate Area
          </MenuItem>
          <MenuItem onClick={handleClearSelection}>
            Uncheck interval
          </MenuItem>
        </Box>
      )}
    </Menu>

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
        onContextMenu={handleChartContextMenu}
      />

      <TabDataset 
        setPreviewData={setPreviewData}
        previewData={previewData} 
      />
    </Box>
    </>
  )
}