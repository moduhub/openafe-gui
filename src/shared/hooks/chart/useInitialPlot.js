import { useEffect, useMemo } from 'react'
import Plotly from 'plotly.js-dist'

export const useInitialPlot = (
  chartRef, datasets, theme, 
  xName, yName, 
  isLogX = false, isNyquist = false, isPolar = false // novo parâmetro
) => {
  const layout = useMemo(() => {
    if (isPolar) {
      return {
        font: { size: 14, color: theme.palette.text.primary },
        showlegend: false,
        paper_bgcolor: 'transparent',
        plot_bgcolor: theme.palette.background.paper,
        margin: { l: 20, r: 10, t: 10, b: 20 },
        polar: {
          bgcolor: 'transparent',
          radialaxis: {
            title: { text: yName },
            color: theme.palette.text.primary,
            gridcolor: theme.palette.divider,
            tickfont: { color: theme.palette.text.primary },
          },
          angularaxis: {
            direction: "counterclockwise",
            rotation: 90,
            gridcolor: theme.palette.divider,
            tickfont: { color: theme.palette.text.primary },
            title: { text: xName }
          }
        },
        autosize: true,
      }
    }
    // Layout retangular padrão
    return {
      font: { size: 14, color: theme.palette.text.primary },
      showlegend: false,
      paper_bgcolor: 'transparent',
      plot_bgcolor: theme.palette.background.paper,
      margin: { l: 20, r: 10, t: 10, b: 20 },
      xaxis: {
        title: { text: xName, standoff: 15 },
        linecolor: theme.palette.text.primary,
        mirror: true,
        gridcolor: theme.palette.divider,
        zerolinecolor: theme.palette.divider,
        automargin: true,
        type: isLogX ? 'log' : 'linear',
      },
      yaxis: {
        title: { text: yName, standoff: 15 },
        linecolor: theme.palette.text.primary,
        mirror: true,
        gridcolor: theme.palette.divider,
        zerolinecolor: theme.palette.divider,
        automargin: true,
        autorange: isNyquist ? 'reversed' : null,
      },
      autosize: true,
    }
  }, [theme, xName, yName, isLogX, isNyquist, isPolar])

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

    let data
    if (isPolar) {
      // Converte x/y para r/theta (módulo/ângulo)
      data = entries.map(([key, ds]) => ({
        r: ds.data[0].y,
        theta: ds.data[0].x,
        mode: 'lines',
        name: key,
        type: 'scatterpolar'
      }))
    } else {
      data = entries.map(([key, ds]) => ({
        x: ds.data[0].x,
        y: ds.data[0].y,
        mode: 'lines',
        name: key,
      }))
    }

    Plotly.react(el, data, layout, config)
  }, [chartRef, datasets, layout, config, isPolar])
}