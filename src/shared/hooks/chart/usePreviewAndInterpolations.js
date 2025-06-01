import { useEffect } from 'react'
import Plotly from 'plotly.js-dist'

export const usePreviewAndInterpolations = (
  chartRefs,
  datasets,
  previewData,
  theme,
  prevLengthsRef
) => {
  useEffect(() => {
    const refs = Array.isArray(chartRefs) ? chartRefs : [chartRefs]
    if (!refs.length) return

    // Map refs to their names
    const refNames = refs.length === 1
      ? ['cvChart']
      : ['bodeMod', 'bodeAng', 'nyquist', 'cvChart']

    refs.forEach((ref, i) => {
      const el = ref?.current
      if (!el) return

      const currentName = refNames[i]
      const data = []

      // Build traces per chart type
      Object.entries(datasets).forEach(([key, ds]) => {
        if (!ds.visible) return

        if (currentName === 'bodeMod') {
          // Bode magnitude
          data.push({
            x: ds.data[0].omega,
            y: ds.data[0].modZ.map(v => 20 * Math.log10(Math.max(v, 1e-12))),
            mode: ds.data[0].mode ?? 'lines',
            name: key,
            line: {
              dash: ds.data[0].line?.dash ?? 'solid',
              width: ds.data[0].line?.width ?? 2,
              color: ds.data[0].line?.color ?? undefined
            }
          })

          // Interpolations
          ds.interpolations?.filter(i => i.isVisible && i.ref === 'bodeMod')
            .forEach(i => data.push({
              x: i.data[0].x,
              y: i.data[0].y,
              mode: i.data[0].mode,
              name: i.data[0].name,
              line: i.data[0].line
            }))

          // markers
          ds.markers?.filter(m => m.isVisible && m.ref === 'bodeMod')
            .forEach(m => data.push({
              x: [m.x], y: [m.y], mode: 'markers', showlegend: false,
              marker: { color: m.color, symbol: m.symbol, size: m.size }, name: m.label
            }))

          // Areas
          ds.areas?.filter(a => a.isVisible && a.ref === 'bodeMod')
            .forEach((a, idx) => {
              const x = ds.data[0].omega.slice(a.start, a.end + 1)
              const y = ds.data[0].modZ.slice(a.start, a.end + 1).map(v => 20 * Math.log10(Math.max(v, 1e-12)))
              data.push({ x, y, mode: 'lines', fill: 'tozeroy', name: `Área ${idx+1}`, showlegend: false })
            })
        }
        else if (currentName === 'bodeAng') {
          // Bode phase
          data.push({
            x: ds.data[0].omega,
            y: ds.data[0].angZ,
            mode: ds.data[0].mode ?? 'lines',
            name: key,
            line: {
              dash: ds.data[0].line?.dash ?? 'solid',
              width: ds.data[0].line?.width ?? 2,
              color: ds.data[0].line?.color ?? undefined
            }
          })

          // Interpolations
          ds.interpolations?.filter(i => i.isVisible && i.ref === 'bodeAng')
            .forEach(i => data.push({
              x: i.data[0].x,
              y: i.data[0].y,
              mode: i.data[0].mode,
              name: i.data[0].name,
              line: i.data[0].line
            }))

          // Markers
          ds.markers?.filter(m => m.isVisible && m.ref === 'bodeAng')
            .forEach(m => data.push({
              x: [m.x], y: [m.y], mode: 'markers', showlegend: false,
              marker: { color: m.color, symbol: m.symbol, size: m.size }, name: m.label
            }))
          
          // Areas
          ds.areas?.filter(a => a.isVisible && a.ref === 'bodeAng')
            .forEach((a, idx) => {
              const x = ds.data[0].omega.slice(a.start, a.end + 1)
              const y = ds.data[0].angZ.slice(a.start, a.end + 1)
              data.push({ x, y, mode: 'lines', fill: 'tozeroy', name: `Área ${idx+1}`, showlegend: false })
            })
        }
        else if (currentName === 'nyquist') {
          // Nyquist
          data.push({
            x: ds.data[0].realZ,
            y: ds.data[0].imagZ,
            mode: ds.data[0].mode ?? 'lines',
            name: key,
            line: {
              dash: ds.data[0].line?.dash ?? 'solid',
              width: ds.data[0].line?.width ?? 2,
              color: ds.data[0].line?.color ?? undefined
            }
          })

          ds.interpolations?.filter(i => i.isVisible && i.ref === 'nyquist')
            .forEach(i => data.push({
              x: i.data[0].x,
              y: i.data[0].y,
              mode: i.data[0].mode,
              name: i.data[0].name,
              line: i.data[0].line
            }))

          // Markers
          ds.markers?.filter(m => m.isVisible && m.ref === 'nyquist')
            .forEach(m => data.push({
              x: [m.x], y: [m.y], mode: 'markers', showlegend: false,
              marker: { color: m.color, symbol: m.symbol, size: m.size }, name: m.label
            }))

          // Areas
          ds.areas?.filter(a => a.isVisible && a.ref === 'nyquist')
            .forEach((a, idx) => {
              const x = ds.data[0].realZ.slice(a.start, a.end + 1)
              const y = ds.data[0].imagZ.slice(a.start, a.end + 1)
              data.push({ x, y, mode: 'lines', fill: 'tozeroy', name: `Área ${idx+1}`, showlegend: false })
            })
        }
        else if (currentName === 'cvChart') {
          // CV main
          data.push({
            x: ds.data[0].x,
            y: ds.data[0].y,
            mode: ds.data[0].mode ?? 'lines',
            name: key,
            line: {
              dash: ds.data[0].line?.dash ?? 'solid',
              width: ds.data[0].line?.width ?? 2,
              color: ds.data[0].line?.color ?? undefined
            }
          })

          // Interpolations
          ds.interpolations?.filter(i => i.isVisible && (i.ref === 'cvChart' || !i.ref))
            .forEach(i => data.push({
              x: i.data[0].x,
              y: i.data[0].y,
              mode: i.data[0].mode,
              name: i.data[0].name,
              line: i.data[0].line
            }))

          // Markers
          ds.markers?.filter(m => m.isVisible && m.ref === 'cvChart')
            .forEach(m => data.push({
              x: [m.x], y: [m.y], mode: 'markers', showlegend: false,
              marker: { color: m.color, symbol: m.symbol, size: m.size }, name: m.label
            }))

          // Areas
          ds.areas?.filter(a => a.isVisible)
            .forEach((a, idx) => {
              const x = ds.data[0].x.slice(a.start, a.end + 1)
              const y = ds.data[0].y.slice(a.start, a.end + 1)
              data.push({ x, y, mode: 'lines', fill: 'tozeroy', name: `Área ${idx+1}`, showlegend: false })
            })

          // Preview overlay
          if (previewData?.x && previewData?.y) {
            data.push({
              x: previewData.x,
              y: previewData.y,
              mode: 'lines',
              name: 'Preview',
              line: { color: theme.palette.secondary.main, dash: 'dot', width: 2 }
            })
          }
        }
      })

      // Build layout per chart
      const layout = {
        font: { size: 14, color: theme.palette.text.primary },
        showlegend: false,
        paper_bgcolor: 'transparent',
        plot_bgcolor: theme.palette.background.paper,
        margin: { l: 20, r: 10, t: 10, b: 20 },
        autosize: true,
        xaxis: {},
        yaxis: {}
      }

      if (currentName === 'bodeMod' || currentName === 'bodeAng') {
        layout.xaxis = {
          title: { text: 'Frequency (Hz)', standoff: 15 },
          type: 'log', mirror: true,
          linecolor: theme.palette.text.primary,
          gridcolor: theme.palette.divider,
          zerolinecolor: theme.palette.divider,
          automargin: true
        }
        layout.yaxis = {
          title: { text: currentName === 'bodeMod' ? '|Z| (dB)' : 'Phase (°)', standoff: 15 },
          mirror: true,
          linecolor: theme.palette.text.primary,
          gridcolor: theme.palette.divider,
          zerolinecolor: theme.palette.divider,
          automargin: true
        }
      } 
      else if (currentName === 'nyquist') {
        layout.xaxis = {
          title: { text: 'Re(Z) (Ohm)', standoff: 15 }, mirror: true,
          linecolor: theme.palette.text.primary,
          gridcolor: theme.palette.divider,
          zerolinecolor: theme.palette.divider,
          automargin: true
        }
        layout.yaxis = {
          title: { text: '-Im(Z) (Ohm)', standoff: 15 }, mirror: true,
          linecolor: theme.palette.text.primary,
          gridcolor: theme.palette.divider,
          zerolinecolor: theme.palette.divider,
          automargin: true,
          autorange: 'reversed'
        }
      } 
      else {
        layout.xaxis = {
          title: { text: 'Voltage (mV)', standoff: 15 },
          mirror: true,
          linecolor: theme.palette.text.primary,
          gridcolor: theme.palette.divider,
          zerolinecolor: theme.palette.divider,
          automargin: true
        }
        layout.yaxis = {
          title: { text: 'Current (µA)', standoff: 15 },
          mirror: true,
          linecolor: theme.palette.text.primary,
          gridcolor: theme.palette.divider,
          zerolinecolor: theme.palette.divider,
          automargin: true
        }
      }

      const config = { scrollZoom: false, displaylogo: false, displayModeBar: false, responsive: true }

      // Render plot
      Plotly.react(el, data, layout, config)

      // Update prevLengths
      if (prevLengthsRef?.current) {
        prevLengthsRef.current = datasets.reduce((acc, ds) => {
          acc[ds.name] = ds.data[0]?.x?.length || 0
          return acc
        }, {})
      }
    })
  }, [chartRefs, datasets, previewData, theme, prevLengthsRef])
}
