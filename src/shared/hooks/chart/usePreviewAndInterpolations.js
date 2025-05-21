// src/components/ChartComponent/hooks/usePreviewAndInterpolations.js
import { useEffect } from 'react'
import Plotly from 'plotly.js-dist'

export const usePreviewAndInterpolations = (chartRef, datasets, previewData, theme, prevLengthsRef) => {
  useEffect(() => {
    const el = chartRef?.current
    if (!el) return

    const entries = Object.entries(datasets)
      .filter(([_, ds]) => ds.data?.[0]?.x && ds.data?.[0]?.y)

    const data = []

    entries.forEach(([key, ds]) => {
      if (ds.visible) {
        data.push({
          x: ds.data[0].x,
          y: ds.data[0].y,
          mode: 'lines',
          name: key,
          line: {
            dash: 'solid',
            width: 2,
          },
        })
      }

      if (Array.isArray(ds.interpolations) && ds.interpolations.length > 0) {
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
      if (Array.isArray(ds.markers) && ds.markers.length > 0) {
        ds.markers
          .filter(marker => marker.isVisible)
          .forEach(marker => {
            data.push({
              x: [marker.x],
              y: [marker.y],
              mode: 'markers',
              name: marker.label || 'Marker',
              marker: {
                color: marker.color,
                symbol: marker.symbol,
                size: 12,
              },
              showlegend: false,
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
          width: 2,
        },
      })
    }

    const layout = {
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
    }

    const config = {
      scrollZoom: false,
      displaylogo: false,
      displayModeBar: false,
      responsive: true,
    }

    Plotly.react(el, data, layout, config)

    if (prevLengthsRef?.current) {
      prevLengthsRef.current = entries.reduce((acc, [key, ds]) => ({
        ...acc,
        [key]: ds.data[0].x.length,
      }), {})
    }
  }, [chartRef, datasets, previewData, theme, prevLengthsRef])
}