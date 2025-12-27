import { useRef, useContext, useEffect, useState } from 'react'
import { Box, ToggleButton, ToggleButtonGroup, Paper, Typography } from '@mui/material'
import CropSquareIcon from '@mui/icons-material/CropSquare'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import {
  ThemeContext,
  useDatasetsContext,
} from '../../contexts'
import {
  useResizeHandler,
  useInitialPlot,
  useExtendTraces,
  usePreviewAndInterpolations,
  useClickHandler,
  useSelectionRenderer
} from '../../hooks'

/**
 * @brief ChartComponent renders an interactive Plotly chart with multiple datasets 
 * 
 * supports:
 *  - Dynamic layout and theming based on the current theme context
 *  - Reactively updates when datasets or preview data change
 *  - Efficiently extends existing traces when new data points arrive
 *  - Supports rendering dataset interpolations with customized styles
 *  - Handles user clicks to select points on the chart (up to 2)
 *  - Highlights selected points and draws a bold line range between two selected points
 *  - Automatically resizes on window resize events
 *  - Cleans up Plotly resources on component unmount
 *
 * @param {Object} type_                      - Layout and sizing info for the chart
 * @param {string|number} type_.height        - Height of the chart container
 * @param {string|number} type_.width         - Width of the chart container
 * 
 * @param {Object} previewData                - Data for the preview overlay line
 * @param {Array<number>} previewData.x       - Array of x values
 * @param {Array<number>} previewData.y       - Array of y values
 * 
 * @param {Function} setSelectedPoints        - Callback to update selected points array
 * 
 * @param {Array<Object>} selectedPoints      - Array of selected points, each with:
 * @param {number} selectedPoints[].x         - x-coordinate of the point.
 * @param {number} selectedPoints[].y         - y-coordinate of the point.
 * @param {string} selectedPoints[].dataset   - Dataset name the point belongs to.
 * @param {string} [selectedPoints[].color]   - Optional color of the point marker.
 */
export const ChartComponent = ({
  type_,
  previewData,
  setSelectedPoints,
  selectedPoints,
  onContextMenu
}) => {
  const { theme } = useContext(ThemeContext)
  const { datasets, handleSetDatasetSelected, experimentType } = useDatasetsContext()

  const bodeModRef = useRef(null)
  const bodeAngRef = useRef(null)
  const nyquistRef = useRef(null)
  const chartRef = useRef(null)
  const prevLengths = useRef({})

  const [isPolar, setIsPolar] = useState(false)
  const [isDb, setIsDb] = useState(true)

  const eisDatasets = datasets.filter(ds => ds.visible && ds.type === 'EIS')

  // EIS: Bode |Z| vs omega
  useInitialPlot(
    bodeModRef,
    experimentType === 'EIS'
      ? eisDatasets.map(ds => ({
          ...ds,
          data: [{ 
            x: ds.data[0].omega,
            y: isDb ? ds.data[0].modZ.map(v => 20 * Math.log10(v > 0 ? v : 1e-12)) : ds.data[0].modZ
          }]
        }))
      : [],
    theme,
    'Frequency (Hz)',
    isDb ? '|Z| (dB)' : '|Z| (Ohm)', // eixo Y
    true, // islogX
  )
  useResizeHandler(bodeModRef)

  // EIS: Bode angZ vs omega
  useInitialPlot(
    bodeAngRef,
    experimentType === 'EIS'
      ? eisDatasets.map(ds => ({
          ...ds,
          data: [{ x: ds.data[0].omega, y: ds.data[0].angZ }]
        }))
      : [],
    theme,
    'Frequency (Hz)',
    'Phase (°)', // eixo Y
    true, // islogX
  )
  useResizeHandler(bodeAngRef)

  // EIS: Nyquist realZ vs imagZ
  useInitialPlot(
    nyquistRef,
    experimentType === 'EIS'
      ? eisDatasets.map(ds => ({
          ...ds,
          data: [{ x: ds.data[0].realZ, y: ds.data[0].imagZ }]
        }))
      : [],
    theme,
    'Re(Z) (Ohm)',
    (isPolar)?'|Z| (Ohm)':'-Im(Z) (Ohm)', // Y invertido, comum em Nyquist
    false, // islogX
    true, // is Nyquist
    isPolar, // Retangular ou Polar
  )
  useResizeHandler(nyquistRef)

  // CV hooks
  useResizeHandler(chartRef)
  useInitialPlot(chartRef,experimentType !== 'EIS' ? datasets : [],theme,'Voltage (mV)','Current (µA)') 
  useExtendTraces(chartRef, experimentType !== 'EIS' ? datasets : [], prevLengths)
  
  // Prepare refs and datasets for preview & markers
  const previewRefs = experimentType === 'EIS'
    ? [bodeModRef, bodeAngRef, nyquistRef]
    : [chartRef]
  const previewDatasets = experimentType === 'EIS' ? eisDatasets : datasets
  usePreviewAndInterpolations(previewRefs, previewDatasets, previewData, theme, prevLengths, isPolar, isDb)

  //Clicks
  let clickRefs = experimentType === 'EIS'
    ? [
        { ref: bodeModRef, name: 'bodeMod' },
        { ref: bodeAngRef, name: 'bodeAng' },
        { ref: nyquistRef, name: 'nyquist' }
      ]
    : [{ ref: chartRef, name: 'cvChart' }]
  useClickHandler(clickRefs, setSelectedPoints, theme, isPolar)

  // Selection rendering 
  useSelectionRenderer(
    previewRefs,
    datasets, handleSetDatasetSelected,
    selectedPoints, setSelectedPoints,
    isPolar,
    isDb
  )

  useEffect(() => {
    if (selectedPoints.length) {
      handleSetDatasetSelected(selectedPoints[0].dataset)
    }
  }, [selectedPoints, handleSetDatasetSelected])

  const commonProps = {
    position: 'absolute',
    top: type_.top,
    right: 0,
    width: type_.width,
    height: type_.height,
    zIndex: 0,
    onContextMenu
  }

  // EIS
  if (experimentType === 'EIS') {
    return (
      <Box 
        key={`chart-${experimentType}`} 
        {...commonProps} 
        display="flex" flexDirection="row"
      >
        <Box position="absolute" top={12} right={12} zIndex={10}>
          <Paper elevation={4} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={isPolar ? 'polar' : 'rectangular'}
              onChange={(_, val) => {
                if (val) setIsPolar(val === 'polar')
              }}
              sx={{
                '& .MuiToggleButton-root': {
                  px: 1.5,
                  py: 0.5,
                  border: 'none'
                },
                '& .MuiToggleButton-root.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' }
                }
              }}
            >
              <ToggleButton value="rectangular">
                <CropSquareIcon fontSize="small" />
                <Typography variant="caption" sx={{ ml: 0.5 }}>Rectangular</Typography>
              </ToggleButton>
              <ToggleButton value="polar">
                <RadioButtonCheckedIcon fontSize="small" />
                <Typography variant="caption" sx={{ ml: 0.5 }}>Polar</Typography>
              </ToggleButton>
            </ToggleButtonGroup>
          </Paper>
        </Box>

        <Box height="97%" width="50%" display="flex" flexDirection="column">
          <Box flex={1} p={1} position="relative">
            <Box position="absolute" top={8} right={8} zIndex={11}>
              <Paper elevation={4} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={isDb ? 'db' : 'linear'}
                  onChange={(_, val) => val !== null && setIsDb(val === 'db')}
                  sx={{
                    '& .MuiToggleButton-root': { px: 1, py: 0.4, border: 'none' },
                    '& .MuiToggleButton-root.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }
                  }}
                >
                  <ToggleButton value="linear">
                    <Typography variant="caption">Linear</Typography>
                  </ToggleButton>
                  <ToggleButton value="db">
                    <Typography variant="caption">dB</Typography>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Paper>
            </Box>
            <div
              ref={bodeModRef}
              data-plotly
              data-chart-type="bodeMod"
              style={{ width: '100%', height: '100%' }}
            />
          </Box>
          <Box flex={1} p={1}>
            <div
              ref={bodeAngRef}
              data-plotly
              data-chart-type="bodeAng"
              style={{ width: '100%', height: '100%' }}
            />
          </Box>
        </Box>
        <Box height="97%" width="50%" p={1}>
          <div
            ref={nyquistRef}
            data-plotly
            data-chart-type="nyquist"
            style={{ width: '100%', height: '100%' }}
          />
        </Box>
      </Box>
    )
  }

  // CV
  return (
    <Box
      key={`chart-${experimentType}`}
      {...commonProps}
    >
      <div
        ref={chartRef}
        data-plotly
        data-chart-type="cvChart"
        style={{ width: '100%', height: '100%' }}
      />
    </Box>
  )

}