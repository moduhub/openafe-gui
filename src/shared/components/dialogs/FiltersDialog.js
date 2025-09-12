import { useState, useEffect, useRef } from 'react'
import {
  Dialog, Box, Typography, Select, MenuItem, Button, IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { 
  ChartComponent, MovingAverage, LowPass, HighPass, BandPass, BandStop
} from '../../components'
import { useDatasetsContext } from '../../contexts'

/**
 * @brief Dialog to apply filters to the datasets and view the preview.
 *
 * Props:
 * @param {boolean} open - Indicates if the dialog is open.
 * @param {() => void} onClose - Function to close the dialog.
 *
 * beahvior:
 * - Reads data and the state of the context of datasets (useDatasetsContext).
 * - Allows you to choose filters for CVW or for each EIS graph (Bode |Z|, Bode Phase, Nyquist).
 * - Generate a preview that can be saved as a new dataset via handleNewDataset.
 */
export const FiltersDialog = ({ open, onClose }) => {
  const {
    datasets, handleNewDataset,
    datasetSelected,
  } = useDatasetsContext()

  const [type, setType] = useState('CVW')
  useEffect(() => {
    setType(datasets[datasetSelected]?.type || 'CVW')
  }, [datasetSelected, datasets])

  // Estados de filtros e previews (igual ao TabFilterComponent)
  const [selectedFilterCVW, setSelectedFilterCVW] = useState('')
  const [selectedFilterBodeMod, setSelectedFilterBodeMod] = useState('')
  const [selectedFilterBodeAng, setSelectedFilterBodeAng] = useState('')
  const [selectedFilterNyquist, setSelectedFilterNyquist] = useState('')

  const [previewCVW, setPreviewCVW] = useState({ x: [], y: [] })
  const [previewBodeMod, setPreviewBodeMod] = useState({ x: [], y: [] })
  const [previewBodeAng, setPreviewBodeAng] = useState({ x: [], y: [] })
  const [previewNyquist, setPreviewNyquist] = useState({ x: [], y: [] })

  const chartAreaRef = useRef(null)

  // Atualiza previewData conforme o tipo
  const [previewData, setPreviewData] = useState({ x: [], y: [] })
  useEffect(() => {
    if (type === 'CVW' || type === 'DPV' || type === 'SWV') setPreviewData(previewCVW)
    else if (type === 'EIS') setPreviewData({
      bodeMod: previewBodeMod,
      bodeAng: previewBodeAng,
      nyquist: previewNyquist,
    })
  }, [type, previewCVW, previewBodeMod, previewBodeAng, previewNyquist])

  const filtersConfig = [
    { label: "MA", tooltip: "Moving Average", component: MovingAverage },
    { label: "LP", tooltip: "Low Pass", component: LowPass },
    { label: "HP", tooltip: "High Pass", component: HighPass },
    { label: "BP", tooltip: "Band Pass", component: BandPass },
    { label: "BS", tooltip: "Band Stop", component: BandStop },
  ]

  const renderFilterBlock = (
    title, selectedFilter, setSelectedFilter,
    preview, setPreview, labelId, dataType
  ) => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1">{title}</Typography>
      <Select
        size="small"
        fullWidth
        value={selectedFilter}
        onChange={e => setSelectedFilter(e.target.value)}
        renderValue={value => {
          if (!value) return <>Selecione um filtro</>
          const { tooltip } = filtersConfig.find(f => f.label === value) || {}
          return tooltip || ''
        }}
        labelId={labelId}
        displayEmpty
      >
        <MenuItem value="" disabled>
          Selecione um filtro
        </MenuItem>
        {filtersConfig.map((filter) => (
          <MenuItem key={filter.label} value={filter.label}>
            {filter.label} - {filter.tooltip}
          </MenuItem>
        ))}
      </Select>
      <Box>
        {(() => {
          const filter = filtersConfig.find(f => f.label === selectedFilter)
          if (!filter) return null
          const FilterComponent = filter.component
          return <FilterComponent setPreviewFilter={setPreview} dataType={dataType} />
        })()}
      </Box>
    </Box>
  )

  // Salvar filtro (igual TabFilterComponent)
  const handleSaveFilter = () => {
    const datasetFiltered = datasets[datasetSelected]
    if (!datasetFiltered) return

    if (type === 'CVW' || type === 'DPV' || type === 'SWV') {
      handleNewDataset(
        `${selectedFilterCVW} de ${datasetFiltered.name}`,
        datasetFiltered.params,
        previewCVW,
        datasetFiltered.type
      )
      setPreviewCVW({ x: [], y: [] })
    } else if (type === 'EIS') {
      const n = previewBodeMod.x.length
      if (
        n < 2 ||
        previewBodeAng.x.length !== n ||
        previewNyquist.x.length !== n
      ) {
        alert('Todos os filtros EIS devem estar aplicados e com o mesmo tamanho!')
        return
      }
      const omega = [...previewBodeMod.x]
      const modZ = [...previewBodeMod.y].map(v => Math.pow(10, v / 20))
      const angZ = [...previewBodeAng.y]
      const realZ = [...previewNyquist.x]
      const imagZ = [...previewNyquist.y]
      handleNewDataset(
        `${selectedFilterBodeMod}/${selectedFilterBodeAng}/${selectedFilterNyquist} de ${datasetFiltered.name}`,
        datasetFiltered.params,
        { omega, modZ, angZ, realZ, imagZ },
        datasetFiltered.type
      )
      setPreviewBodeMod({ x: [], y: [] })
      setPreviewBodeAng({ x: [], y: [] })
      setPreviewNyquist({ x: [], y: [] })
    }
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'row', height: 600 }}>

        <Box sx={{ flex: 1, minWidth: 400, pl: 2, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="caption" sx={{ mb: 1, textAlign: 'center' }}>
            Visualização do filtro
          </Typography>
          <Box sx={{ flex: 1, position: 'relative' }}>
            <ChartComponent
              type_={{ height: '100%', width: '100%' }}
              previewData={previewData}
              setSelectedPoints={() => {}}
              selectedPoints={[]}
              chartAreaRef={chartAreaRef}
            />
          </Box>
        </Box>

        <Box sx={{ 
          width: 300, height: '100%',
          display: 'flex', flexDirection: 'column',
        }}>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flex: 1 }}>Filtros</Typography>
            <IconButton onClick={onClose}><CloseIcon /></IconButton>
          </Box>

          <Box sx={{
            overflowY: 'auto'
          }}
          >
            {(type === 'CVW' || type === 'DPV' || type === 'SWV') && (
              renderFilterBlock("CVW", selectedFilterCVW, setSelectedFilterCVW, previewCVW, setPreviewCVW, "filtro-cvw-label", "cvw")
            )}
            {type === 'EIS' && (
              <>
                {renderFilterBlock("Bode |Z|", selectedFilterBodeMod, setSelectedFilterBodeMod, previewBodeMod, setPreviewBodeMod, "filtro-bodemod-label", "bodeMod")}
                {renderFilterBlock("Bode Fase", selectedFilterBodeAng, setSelectedFilterBodeAng, previewBodeAng, setPreviewBodeAng, "filtro-bodeang-label", "bodeAng")}
                {renderFilterBlock("Nyquist", selectedFilterNyquist, setSelectedFilterNyquist, previewNyquist, setPreviewNyquist, "filtro-nyquist-label", "nyquist")}
              </>
            )}
          </Box>

          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 'auto' }}
            onClick={handleSaveFilter}
            disabled={
              ((type === 'CVW' || type === 'DPV' || type === 'SWV') && !selectedFilterCVW) ||
              (type === 'EIS' && (
                !selectedFilterBodeMod ||
                !selectedFilterBodeAng ||
                !selectedFilterNyquist ||
                !previewBodeMod.x.length ||
                !previewBodeAng.x.length ||
                !previewNyquist.x.length ||
                previewBodeMod.x.length !== previewBodeAng.x.length ||
                previewBodeMod.x.length !== previewNyquist.x.length
              ))
            }
          >
            Save filter
          </Button>
        </Box>
        
      </Box>
    </Dialog>
  )
}

/*
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
      previewFilter,
      datasetFiltered.type
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
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            ml={1}
          >
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
*/