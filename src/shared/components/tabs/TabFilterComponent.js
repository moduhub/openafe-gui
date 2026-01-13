import { useState, useEffect } from "react"
import {
  Box, Button, useTheme, Typography, Select,
  MenuItem, ListItemIcon, ListItemText,
} from '@mui/material'

import FilterListIcon from '@mui/icons-material/FilterList'

import { FiltersDialog } from '..'
import { useDatasetsContext } from '../../contexts'
import { MovingAverage, LowPass, HighPass, BandPass, BandStop } from '..'

/**
 * @brief TabFilter component allows selection and application of filters to datasets
 * 
 * @param {function} setPreviewData - Function to update the filtered preview data
 * @param {{ x: any[], y: any[] }} previewData - The current data previewed for filtering
 * @param {function} setTabIndex - Function to switch tabs in the parent component
 * 
 * Behavior:
 * - Displays filter options based on the type of the selected dataset (CVW or EIS).
 * - Allows users to select filters for CVW (Moving Average, Low Pass, High Pass, Band Pass, Band Stop).
 */
export const TabFilter = ({
  setPreviewData,
  previewData,
  setTabIndex
}) => {
  const theme = useTheme()

  const [selectedFilter, setSelectedFilter] = useState('')
  const [openFilters, setOpenFilters] = useState(false)

  const [selectedFilterCVW, setSelectedFilterCVW] = useState('')
  const [selectedFilterBodeMod, setSelectedFilterBodeMod] = useState('')
  const [selectedFilterBodeAng, setSelectedFilterBodeAng] = useState('')
  const [selectedFilterNyquist, setSelectedFilterNyquist] = useState('')

  const [previewVoltammetry, setpreviewVoltammetry] = useState({ x: [], y: [] })
  const [previewBodeMod, setPreviewBodeMod] = useState({ x: [], y: [] })
  const [previewBodeAng, setPreviewBodeAng] = useState({ x: [], y: [] })
  const [previewNyquist, setPreviewNyquist] = useState({ x: [], y: [] })

  const {
    datasets, handleNewDataset,
    datasetSelected
  } = useDatasetsContext()

  const [type, setType] = useState('CVW')

  useEffect(() => {
    if(datasetSelected >= 0 && datasetSelected < datasets.length)
      setType(datasets[datasetSelected].type)
    else
      setType(undefined)
  }, [datasetSelected])

  useEffect(() => {
    if (type === 'CVW' || type === 'DPV' || type === 'SWV') {
      setPreviewData(previewVoltammetry)
    } else if (type === 'EIS') {
      setPreviewData({
        bodeMod: previewBodeMod,
        bodeAng: previewBodeAng,
        nyquist: previewNyquist,
      })
    }
    // eslint-disable-next-line
  }, [previewVoltammetry, previewBodeMod, previewBodeAng, previewNyquist, type])


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
    <Box sx={{ mt: 2, px: 2, backgroundColor: 'background.paper', color: 'text.primary', borderRadius: 1, py: 1 }}>
      <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>{title}</Typography>
      <Select
        size="small"
        fullWidth
        value={selectedFilter}
        onChange={e => setSelectedFilter(e.target.value)}
        renderValue={value => {
          if (!value) return <>Select a filter</>
          const { tooltip } = filtersConfig.find(f => f.label === value) || {}
          return tooltip || ''
        }}
        labelId={labelId}
        displayEmpty
        sx={{ color: 'text.primary', '& .MuiSelect-icon': { color: 'text.primary' } }}
        MenuProps={{ PaperProps: { sx: { bgcolor: 'background.paper' } } }}
      >
        <MenuItem value="" disabled>
          Select a filter
        </MenuItem>
        {filtersConfig.map((filter) => (
          <MenuItem key={filter.label} value={filter.label}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <FilterListIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={filter.label + " - " + filter.tooltip} />
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

  const handleSaveFilterCVW = () => {
    setTabIndex(0)
    const datasetFiltered = datasets[datasetSelected]
    handleNewDataset(
      `${selectedFilterCVW} de ${datasetFiltered.name}`,
      datasetFiltered.params,
      previewVoltammetry,
      datasetFiltered.type
    )
    setpreviewVoltammetry({ x: [], y: [] })
  }

  const handleSaveFilterEIS = () => {
    setTabIndex(0)
    const datasetFiltered = datasets[datasetSelected]
    const n = previewBodeMod.x.length
    if (
      n < 2 ||
      previewBodeAng.x.length !== n ||
      previewNyquist.x.length !== n
    ) {
      alert('All EIS filters must be applied and of the same size!')
      return
    }

    const omega = [...previewBodeMod.x]
    const modZ = [...previewBodeMod.y]
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

  const handleCloseFilters = () => {
    setOpenFilters(false)
    setTabIndex(0)
  }

  return (
    <>
      <FiltersDialog open={openFilters} onClose={handleCloseFilters} />

      <Box
        sx={{
          height: 387.9, //440
          width: 248,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          mb: '16px'
        }}
      >
        

        {datasets.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            align="center"
            sx={{ padding: theme.spacing(2), marginTop: theme.spacing(2) }}
          >
            There are no datasets in cache at the moment.
          </Typography>
        ) : (
          <>
            <Box sx={{width:'100%', mt:2, mb:1}}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FilterListIcon />}
                onClick={() => setOpenFilters(true)}
              >
                Open filter dialog
              </Button>
            </Box>

            {(type === 'CVW' || type === 'DPV' || type === 'SWV') && (
              renderFilterBlock(type, selectedFilterCVW, setSelectedFilterCVW, previewVoltammetry, setpreviewVoltammetry, "filtro-cvw-label", "cvw")
            )}

            {type === 'EIS' && (
              <>
                {renderFilterBlock("Bode |Z|", selectedFilterBodeMod, setSelectedFilterBodeMod, previewBodeMod, setPreviewBodeMod, "filtro-bodemod-label", "bodeMod")}
                {renderFilterBlock("Bode Fase", selectedFilterBodeAng, setSelectedFilterBodeAng, previewBodeAng, setPreviewBodeAng, "filtro-bodeang-label", "bodeAng")}
                {renderFilterBlock("Nyquist", selectedFilterNyquist, setSelectedFilterNyquist, previewNyquist, setPreviewNyquist, "filtro-nyquist-label", "nyquist")}
              </>
            )}

          </>
        )}

      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={(type === 'CVW' || type === 'DPV' || type === 'SWV') ? handleSaveFilterCVW : handleSaveFilterEIS}
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
          )) ||
          !(datasetSelected >= 0 && datasetSelected < datasets.length)
        }
      >
        {(type === 'CVW' || type === 'DPV' || type === 'SWV') ? 'Save filter CVW' : 'Save filter EIS'}
      </Button>
    </>
  )
}