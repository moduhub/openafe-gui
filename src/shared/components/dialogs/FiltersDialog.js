import { useEffect, useState } from 'react'
import {
  Dialog,
  Box,
  Typography,
  Tabs,
  Tab,
  Tooltip,
  Paper,
  Select,
  MenuItem,
  Button,
  IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

import { 
  ChartComponent,
  MovingAverage,
  LowPass, 
  HighPass,
  BandPass,
  BandStop
} from '../../components'

import { useDatasetsContext } from '../../contexts'

export const FiltersDialog = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [previewFilter, setPreviewFilter] = useState({ x: [], y: [] })
  const [selectedPoints, setSelectedPoints] = useState([])

  const { 
    datasets, handleNewDataset,
    datasetSelected, handleSetDatasetSelected, 
    showOnlyDataset,
  } = useDatasetsContext()

  const type_chart_filters = {
    height: '100%',
    width: '100%'
  }

  const filtersConfig = [
    { label: "MA", tooltip: "Moving Average", component: <MovingAverage setPreviewFilter={setPreviewFilter}/> },
    { label: "LP", tooltip: "Low Pass", component: <LowPass setPreviewFilter={setPreviewFilter}/> },
    { label: "HP", tooltip: "High Pass", component: <HighPass setPreviewFilter={setPreviewFilter}/> },
    { label: "BP", tooltip: "Band Pass", component: <BandPass setPreviewFilter={setPreviewFilter}/> },
    { label: "BS", tooltip: "Band Stop", component: <BandStop setPreviewFilter={setPreviewFilter}/> },
  ]

  const chartParams = {
    type_: type_chart_filters,
    previewData: previewFilter,
    setSelectedPoints: setSelectedPoints,
    selectedPoints: selectedPoints,
  }

  const handleSaveFilter = () => {
    const datasetFiltered = datasets[datasetSelected]
    if (!datasetFiltered) return

    handleNewDataset(
      `${filtersConfig[activeTab].label} de ${datasetFiltered.name}`,
      datasetFiltered.params,
      previewFilter
    )
    setPreviewFilter({ x: [], y: [] })
    onClose()
  }

  const handleUpdateVisibility = (e) => {
      const value = Number(e.target.value) 
      handleSetDatasetSelected(value)
      showOnlyDataset(value)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      
      PaperProps={{
        sx: {
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255,255,255,0.85)',
          boxShadow: 24,
          height: 600,
          minWidth: 900,
        }
      }}
    >
      <Box 
        height="100%" 
        sx={{ 
          position: 'relative', 
          p: 2, 
          height: '100%', 
          display: 'flex', flexDirection: 'column' 
          }}
      >
        
        <Paper
          elevation={2}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '48px',
            px: 1,
            mb: 2
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              minHeight: '48px',
              '& .MuiTab-root': { minHeight: '48px' }
            }}
          >
            {filtersConfig.map((filter, index) => (
              <Tooltip key={filter.label} title={filter.tooltip}>
                <Tab label={filter.label} />
              </Tooltip>
            ))}
          </Tabs>
          <Box
            width="25%"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            ml={2}
          >
            <Select
              value={datasetSelected}
              onChange={handleUpdateVisibility}
              size="small"
              sx={{ width: '80%' }}
            >
              {datasets.map((dataset, index) => (
                <MenuItem key={index} value={index}>
                  {dataset.name}
                </MenuItem>
              ))}
            </Select>
            <IconButton
              onClick={onClose}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Paper>
        <Box
          height="100%" 
          sx={{ display: 'flex', flex: 1, gap: 2 }}
        >
          {/* Left Side - Controls */}
          <Box sx={{
            width: '280px',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            height: "100%"
          }}>
            {filtersConfig[activeTab].component}
            <Box sx={{ mt: 'auto', pt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveFilter}
              >
                Salvar Filtro
              </Button>
            </Box>
          </Box>
          {/* Right Side - Preview Chart */}
          <Box sx={{
            width: '600px',
            padding: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '95%'
          }}>
            <Typography
              variant="caption"
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
                mb: 0.5
              }}
            >
              Preview Visualization
            </Typography>
            <Box sx={{
              flex: 1,
              position: 'relative',
              height: '500px'
            }}>
              <ChartComponent
                {...chartParams}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Dialog>
  )
}