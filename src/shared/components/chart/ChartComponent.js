import React, { useEffect, useMemo, useContext, useRef } from 'react'
import { Box } from '@mui/material'
import Plotly from 'plotly.js-dist'

import {
  ThemeContext,
  useDatasetsContext,
} from '../../contexts'

export const ChartComponent = ({ type_ }) => {
  const { theme } = useContext(ThemeContext)
  const { datasets } = useDatasetsContext()
  const chartRef = useRef(null)
  
  const prevLengths = useRef({})

  const layout = useMemo(() => ({
    font: { size: 14, color: theme.palette.text.primary },
    showlegend: false,
    paper_bgcolor: 'transparent',
    plot_bgcolor: theme.palette.background.paper,
    margin: { l: 30, r: 10, t: 10, b: 20 },
    xaxis: {
      title: 'Voltage (mV)',
      linecolor: theme.palette.text.primary,
      mirror: true,
      gridcolor: theme.palette.divider,
      zerolinecolor: theme.palette.divider,
      automargin: false,
      title_standoff: 0,
    },
    yaxis: {
      title: 'Current (uA)',
      linecolor: theme.palette.text.primary,
      mirror: true,
      gridcolor: theme.palette.divider,
      zerolinecolor: theme.palette.divider,
      automargin: false,
      title_standoff: 0,
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

  useEffect(() => {
    const el = chartRef.current
    if (!el) return

    Object.entries(datasets).forEach(([key, ds], idx) => {
      if (!ds.visible || !ds.data?.[0]?.x) return

      const xArr = ds.data[0].x
      const yArr = ds.data[0].y
      const prev = prevLengths.current[key] || 0

      // Se vieram novos pontos
      if (xArr.length > prev) {
        const newX = xArr.slice(prev)
        const newY = yArr.slice(prev)
        Plotly.extendTraces(el, { x: [newX], y: [newY] }, [idx])
        prevLengths.current[key] = xArr.length
      }
    })
  }, [datasets])

  // 4) Purge apenas no unmount
  useEffect(() => () => {
    if (chartRef.current) Plotly.purge(chartRef.current)
  }, [])

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
