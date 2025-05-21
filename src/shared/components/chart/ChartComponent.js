import React, { useEffect, useMemo, useContext, useRef } from 'react'
import { Box } from '@mui/material'
import Plotly from 'plotly.js-dist'

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
  const { datasets, handleSetDatasetSelected } = useDatasetsContext()
  const chartRef = useRef(null)
  const prevLengths = useRef({})

  
  useResizeHandler(chartRef)
  
  useInitialPlot(chartRef, datasets, theme)

  useExtendTraces(chartRef, datasets, prevLengths)
  
  usePreviewAndInterpolations(chartRef, datasets, previewData, theme, prevLengths)

  useClickHandler(chartRef, setSelectedPoints, theme)

  useSelectionRenderer(chartRef, datasets, selectedPoints, setSelectedPoints, handleSetDatasetSelected)

  return (
    <Box
      ref={chartRef}
      position="absolute"
      top={type_.top}
      right={0}
      height={type_.height}
      width={type_.width}
      zIndex={0}
      onContextMenu={onContextMenu}
    />
  )
}