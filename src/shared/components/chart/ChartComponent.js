import React, { useEffect, useMemo, useContext, useRef } from 'react'
import { Box } from '@mui/material'
import Plotly from 'plotly.js-dist'

import {
  ThemeContext,
  useDatasetsContext,
} from '../../contexts'

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
export const ChartComponent = ({ type_, previewData, setSelectedPoints, selectedPoints }) => {
  const { theme } = useContext(ThemeContext)
  const { datasets, handleSetDatasetSelected } = useDatasetsContext()
  
  const chartRef = useRef(null)
  const prevLengths = useRef({})

  const layout = useMemo(() => ({
    font: { size: 14, color: theme.palette.text.primary },
    showlegend: false,
    paper_bgcolor: 'transparent',
    plot_bgcolor: theme.palette.background.paper,
    margin: { l: 20, r: 10, t: 10, b: 20 },
    xaxis: {
      title: { text: 'Voltage (mV)', standoff: 15 },
      linecolor: theme.palette.text.primary,
      mirror: true,
      gridcolor: theme.palette.divider,
      zerolinecolor: theme.palette.divider,
      automargin: true, 
    },
    yaxis: {
      title: { text: 'Current (uA)', standoff: 15 },
      linecolor: theme.palette.text.primary,
      mirror: true,
      gridcolor: theme.palette.divider,
      zerolinecolor: theme.palette.divider,
      automargin: true,
    },
    autosize: true,
  }), [theme])

  const config = useMemo(() => ({
    scrollZoom: false,
    displaylogo: false,
    displayModeBar: false,
    responsive: true,
  }), [])

  useEffect(() => {
    const handleResize = () => {
      const el = chartRef.current
      if (el && el._fullLayout) Plotly.Plots.resize(el)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const el = chartRef.current
    if (!el) return

    const entries = Object.entries(datasets)
      .filter(([_, ds]) => ds.visible && ds.data?.[0]?.x && ds.data?.[0]?.y)
    const data = entries.map(([key, ds]) => ({
        x: ds.data[0].x,
        y: ds.data[0].y,
        mode: 'lines',
        name: key,
    }))

    prevLengths.current = entries.reduce((acc, [key, ds]) => ({
      ...acc,
      [key]: ds.data[0].x.length
    }), {})

    Plotly.react(el, data, layout, config)
  }, [
    JSON.stringify(Object.entries(datasets)
      .filter(([_, ds]) => ds.visible)
      .map(([key]) => key))
  , layout, config])

  // 2) ExtendTraces para novos pontos nos datasets
  useEffect(() => {
    const el = chartRef.current
    if (!el) return

    const entries = Object.entries(datasets)
      .filter(([_, ds]) => ds.visible && ds.data?.[0]?.x)

    const visibleKeys = entries.map(([key]) => key)

    Object.entries(datasets).forEach(([key, ds]) => {
      if (!ds.visible || !ds.data?.[0]?.x) return

      const traceIndex = visibleKeys.indexOf(key)
      if (traceIndex === -1) return

      const xArr = ds.data[0].x
      const yArr = ds.data[0].y
      const prev = prevLengths.current[key] || 0

      if (xArr.length > prev) {
        const newX = xArr.slice(prev)
        const newY = yArr.slice(prev)

        Plotly.extendTraces(
          el,
          { x: [newX], y: [newY] },
          [traceIndex]
        )

        prevLengths.current[key] = xArr.length
      }
    })
  }, [datasets])

  // 3) Re-render quando previewData mudar (também com interpolações)
  useEffect(() => {
    const el = chartRef.current
    if (!el) return

    const entries = Object.entries(datasets)
      .filter(([_, ds]) => ds.data?.[0]?.x && ds.data?.[0]?.y)

    const data = []

    entries.forEach(([key, ds]) => {
      if (ds.visible) {
        data.push({
          x: ds.data[0].x,
          y: ds.data[0].y,
          mode: "lines",
          name: key,
          line: {
            dash: "solid",
            width: 2,
          }
        })
      }

      if (ds.interpolations?.length > 0) {
        ds.interpolations
          .filter(interp => interp.isVisible)
          .forEach(interp => {
            data.push({
              x: interp.data[0].x,
              y: interp.data[0].y,
              mode: interp.data[0].mode,
              name: interp.data[0].name,
              line: interp.data[0].line,
            })
          })
      }
    })

    if (previewData?.x && previewData?.y) {
      data.push({
        x: previewData.x,
        y: previewData.y,
        mode: 'lines',
        name: 'Preview',
        line: {
          color: theme.palette.secondary.main,
          dash: 'dot',
          width: 2
        }
      })
    }

    prevLengths.current = entries.reduce((acc, [key, ds]) => ({
      ...acc,
      [key]: ds.data[0].x.length
    }), {})

    Plotly.react(el, data, layout, config)
  },  [ datasets, layout, config ])

  // Cleanup on unmount
  useEffect(() => () => {
    if (chartRef.current) Plotly.purge(chartRef.current)
  }, [])

  // 4) Captura de cliques
  useEffect(() => {
    const el = chartRef.current
    if (!el) return

    const handleClick = (eventData) => {
      if (!eventData?.points?.length) return
      const pt = eventData.points[0]
      if (pt.data.name.startsWith('Interpolação')) return

      setSelectedPoints(prev => {
        if (prev.length && prev[0].dataset !== pt.data.name) {
          return [{ x: pt.x, y: pt.y, dataset: pt.data.name, color: pt.fullData.line?.color || theme.palette.secondary.main }]
        }
        const dup = prev.some(p => p.x === pt.x && p.y === pt.y)
        if (!dup && prev.length < 2) {
          return [...prev, { x: pt.x, y: pt.y, dataset: pt.data.name, color: pt.fullData.line?.color || theme.palette.secondary.main }]
        }
        return prev
      })
      //setSelectedDataset(pt.data.name)
    }

    el.on('plotly_click', handleClick)
    return () => el.removeListener('plotly_click', handleClick)
  }, [theme])

  // 5) Desenha marcadores + faixa em negrito
  useEffect(() => {
    const el = chartRef.current
    if (!el) return

    // Remove os traces antigos de seleção/highlight
    const removeIdx = el.data
      .map((t, i) =>
        t.name === 'Selected Points' || t.name === 'Highlight Range' ? i : -1
      )
      .filter(i => i >= 0)
    if (removeIdx.length) {
      Plotly.deleteTraces(el, removeIdx)
    }

    const toAdd = []

    // Desenha os pontos selecionados (se houver)
    if (selectedPoints.length) {
      toAdd.push({
        x: selectedPoints.map(p => p.x),
        y: selectedPoints.map(p => p.y),
        mode: 'markers',
        marker: {
          size: 20,
          color: 'red',
          symbol: 'sphere'
        },
        name: 'Selected Points',
        showlegend: false
      })
    }

    // Se exatos 2 pontos, desenha o range entre eles
    if (selectedPoints.length === 2) {
      const [p1, p2] = selectedPoints
      const ds = datasets[p1.dataset]?.data[0]
      if (ds) {
        const { x: xs, y: ys } = ds

        // Encontra o índice exato de cada ponto comparando x e y
        const i1 = xs.findIndex((x, i) => x === p1.x && ys[i] === p1.y)
        const i2 = xs.findIndex((x, i) => x === p2.x && ys[i] === p2.y)

        if (i1 >= 0 && i2 >= 0) {
          const [s, e] = [Math.min(i1, i2), Math.max(i1, i2)]
          toAdd.push({
            x: xs.slice(s, e + 1),
            y: ys.slice(s, e + 1),
            mode: 'lines',
            line: { width: 4, color: 'red' },
            name: 'Highlight Range',
            showlegend: false
          })

          // Confirma dataset e mantém pontos selecionados
          setSelectedPoints(selectedPoints)
          handleSetDatasetSelected(p1.dataset)
        }
      }
    }

    // Adiciona os novos traces
    if (toAdd.length) {
      Plotly.addTraces(el, toAdd)
    }
  }, [
    selectedPoints,
    datasets,
    handleSetDatasetSelected,
    setSelectedPoints
  ])


  return (
    <Box
      ref={chartRef}
      position="absolute"
      top={type_.top}
      right={0}
      height={type_.height}
      width={type_.width}
      zIndex={0}
    />
  )
}