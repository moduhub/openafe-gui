  import { useRef, useContext, useEffect } from 'react'
  import { Box } from '@mui/material'
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
   * ChartComponent renders an interactive Plotly chart with multiple datasets and supports:
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

    const eisDatasets = datasets.filter(ds => ds.visible && ds.type === 'EIS')

    // EIS: Bode |Z| vs omega
    useInitialPlot(
      bodeModRef,
      experimentType === 'EIS'
        ? eisDatasets.map(ds => ({
            ...ds,
            data: [{ x: ds.data[0].omega, y: ds.data[0].modZ }]
          }))
        : [],
      theme,
      'Frequency (Hz)',
      '|Z| (Ohm)' // eixo Y
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
      'Phase (°)' // eixo Y
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
      '-Im(Z) (Ohm)' // Y invertido, comum em Nyquist
    )
    useResizeHandler(nyquistRef)

    // CV hooks
    useResizeHandler(chartRef)
    useInitialPlot( chartRef, experimentType !== 'EIS' ? datasets : [], theme, 'Voltage (mV)', 'Current (µA)')
    useExtendTraces(chartRef, experimentType !== 'EIS' ? datasets : [], prevLengths)
    usePreviewAndInterpolations(chartRef, experimentType !== 'EIS' ? datasets : [], previewData, theme, prevLengths)

    //Clicks
    const clickRefs = experimentType === 'EIS'
      ? [bodeModRef, bodeAngRef, nyquistRef]
      : [chartRef]
    useClickHandler(clickRefs, setSelectedPoints, theme)

    // Selection Render
    useSelectionRenderer(
      clickRefs,        
      datasets,
      selectedPoints,
      setSelectedPoints,
      handleSetDatasetSelected
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
      <Box key={`chart-${experimentType}`} {...commonProps} display="flex" flexDirection="row">
        <Box display="flex" flexDirection="column" flex={1}>
          <Box flex={1} p={1}>
            <div ref={bodeModRef} style={{ width: '100%', height: '100%' }} />
          </Box>
          <Box flex={1} p={1}>
            <div ref={bodeAngRef} style={{ width: '100%', height: '100%' }} />
          </Box>
        </Box>
        <Box height="97%" width="50%" p={1}>
          <div ref={nyquistRef} style={{ width: '100%', height: '100%' }} />
        </Box>
      </Box>
    )
  }

  // CV
  return (
    <Box key={`chart-${experimentType}`} {...commonProps} ref={chartRef} />
  )

}