import { useState, useEffect } from 'react'
import { Box } from '@mui/material'

import { 
  ChartComponent,
  TabArduino, 
  TabDataset, 
  InterpolationDialog
} from '../../shared/components'

export const Dashboard = () => {

  const [previewData, setPreviewData] = useState({ x: [], y: [] })

  let type_chart_dashboard = {
    top : '64px',
    height : 'calc(100% - 64px)',
    width : '100%'
  }

  const [selectedPoints, setSelectedPoints] = useState([])
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    if (selectedPoints.length > 0) {
      setOpenDialog(true)
    }
  }, [selectedPoints])

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedPoints([])
  }

  return (
    <>
    <InterpolationDialog 
      open={openDialog}
      onClose={handleCloseDialog}
      selectedPoints={selectedPoints}
    />

    <Box 
      height="100%" width="100%" 
      display="flex" flexDirection="column"
    >
      {/* Menu lateral */}
      <TabArduino />

      {/* Gráfico */}
      <ChartComponent 
        type_={type_chart_dashboard} 
        previewData={previewData}
        onPointsSelected={setSelectedPoints}
      />

      {/* Controle de Datasets */}
      <TabDataset 
        setPreviewData={setPreviewData}
        previewData={previewData} 
      />
      
    </Box>
    </>
  )
}