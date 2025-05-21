import { useEffect, useMemo } from 'react'
import Plotly from 'plotly.js-dist'

export const useInitialPlot = (chartRef, datasets, theme) => {
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

    Plotly.react(el, data, layout, config)
  }, [chartRef, datasets, layout, config])
}