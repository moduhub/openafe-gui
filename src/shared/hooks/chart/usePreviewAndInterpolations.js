import { useEffect } from 'react'
import Plotly from 'plotly.js-dist'

export const usePreviewAndInterpolations = (
  chartRefs,
  datasets,
  previewData,
  theme,
  prevLengthsRef,
  isPolar
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

          // Preview overlay
          if (previewData?.bodeMod?.x && previewData?.bodeMod?.y) {
            data.push({
              x: previewData.bodeMod.x,
              y: previewData.bodeMod.y,
              mode: 'lines',
              name: 'Preview',
              line: { color: theme.palette.secondary.main, dash: 'dot', width: 2 }
            })
          }
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
          
          // Preview overlay
          if (previewData?.bodeAng?.x && previewData?.bodeAng?.y) {
            data.push({
              x: previewData.bodeAng.x,
              y: previewData.bodeAng.y,
              mode: 'lines',
              name: 'Preview',
              line: { color: theme.palette.secondary.main, dash: 'dot', width: 2 }
            })
          }
        }
        else if (currentName === 'nyquist') {
          // Nyquist
          if (isPolar) {
            // Polar: converter realZ/imagZ para r/theta
            const realZ = ds.data[0].realZ
            const imagZ = ds.data[0].imagZ
            const r = realZ.map((x, i) => Math.sqrt(x * x + imagZ[i] * imagZ[i]))
            const theta = realZ.map((x, i) => Math.atan2(imagZ[i], x) * 180 / Math.PI)
            data.push({
              r,
              theta,
              mode: ds.data[0].mode ?? 'lines',
              name: key,
              line: {
                dash: ds.data[0].line?.dash ?? 'solid',
                width: ds.data[0].line?.width ?? 2,
                color: ds.data[0].line?.color ?? undefined
              },
              type: 'scatterpolar'
            })
          } else {
            // Retangular
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
          }

          // Interpolations
          ds.interpolations?.filter(i => i.isVisible && i.ref === 'nyquist')
            .forEach(i => {
              if (isPolar) {
                // Converter interpolação para polar
                const xArr = i.data[0].x
                const yArr = i.data[0].y
                const r = xArr.map((x, idx) => Math.sqrt(x * x + yArr[idx] * yArr[idx]))
                const theta = xArr.map((x, idx) => Math.atan2(yArr[idx], x) * 180 / Math.PI)
                data.push({
                  r,
                  theta,
                  mode: i.data[0].mode,
                  name: i.data[0].name,
                  line: i.data[0].line,
                  type: 'scatterpolar'
                })
              } else {
                data.push({
                  x: i.data[0].x,
                  y: i.data[0].y,
                  mode: i.data[0].mode,
                  name: i.data[0].name,
                  line: i.data[0].line
                })
              }
            })

          // Markers
          ds.markers?.filter(m => m.isVisible && m.ref === 'nyquist')
            .forEach(m => {
              if (isPolar) {
                const r = Math.sqrt(m.x * m.x + m.y * m.y)
                const theta = Math.atan2(m.y, m.x) * 180 / Math.PI
                data.push({
                  r: [r], theta: [theta], mode: 'markers', showlegend: false,
                  marker: { color: m.color, symbol: m.symbol, size: m.size }, name: m.label,
                  type: 'scatterpolar'
                })
              } else {
                data.push({
                  x: [m.x], y: [m.y], mode: 'markers', showlegend: false,
                  marker: { color: m.color, symbol: m.symbol, size: m.size }, name: m.label
                })
              }
            })

          // Areas
          ds.areas?.filter(a => a.isVisible && a.ref === 'nyquist')
            .forEach((a, idx) => {
              if (isPolar) {
                const realZ = ds.data[0].realZ.slice(a.start, a.end + 1)
                const imagZ = ds.data[0].imagZ.slice(a.start, a.end + 1)
                const r = realZ.map((x, i) => Math.sqrt(x * x + imagZ[i] * imagZ[i]))
                const theta = realZ.map((x, i) => Math.atan2(imagZ[i], x) * 180 / Math.PI)
                data.push({
                  r,
                  theta,
                  mode: 'lines',
                  fill: 'tozeroy',
                  name: `Área ${idx+1}`,
                  showlegend: false,
                  type: 'scatterpolar'
                })
              } else {
                const x = ds.data[0].realZ.slice(a.start, a.end + 1)
                const y = ds.data[0].imagZ.slice(a.start, a.end + 1)
                data.push({ x, y, mode: 'lines', fill: 'tozeroy', name: `Área ${idx+1}`, showlegend: false })
              }
            })

            // Preview overlay
            if (previewData?.nyquist?.x && previewData?.nyquist?.y) {
              data.push({
                x: previewData.nyquist.x,
                y: previewData.nyquist.y,
                mode: 'lines',
                name: 'Preview',
                line: { color: theme.palette.secondary.main, dash: 'dot', width: 2 }
              })
            }

            // Preview overlay
            if (previewData?.x && previewData?.y && previewData.x.length && previewData.y.length) {
              if (isPolar) {
                const r = previewData.x.map((x, i) => Math.sqrt(x * x + previewData.y[i] * previewData.y[i]))
                const theta = previewData.x.map((x, i) => Math.atan2(previewData.y[i], x) * 180 / Math.PI)
                data.push({
                  r,
                  theta,
                  mode: 'lines',
                  name: 'Preview',
                  line: { color: theme.palette.secondary.main, dash: 'dot', width: 2 },
                  type: 'scatterpolar'
                })
              } else {
                data.push({
                  x: previewData.x,
                  y: previewData.y,
                  mode: 'lines',
                  name: 'Preview',
                  line: { color: theme.palette.secondary.main, dash: 'dot', width: 2 }
                })
              }
            }
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
          ds.interpolations?.filter(i => i.isVisible)
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
      let layout
      if (isPolar && currentName === 'nyquist') {
        layout = {
          font: { size: 14, color: theme.palette.text.primary },
          showlegend: false,
          paper_bgcolor: 'transparent',
          plot_bgcolor: theme.palette.background.paper,
          margin: { l: 45, r: 45, t: 30, b: 30 },
          polar: {
            bgcolor: 'white',
            radialaxis: {
              title: { text: '|Z| (Ohm)' },
              color: theme.palette.text.primary,
              gridcolor: theme.palette.divider,
              tickfont: { color: theme.palette.text.primary },
            },
            angularaxis: {
              direction: "counterclockwise",
              rotation: 90,
              gridcolor: theme.palette.divider,
              tickfont: { color: theme.palette.text.primary },
              title: { text: 'Phase (°)' }
            }
          },
          autosize: true,
        }
      } 
      else {
        layout = {
          font: { size: 14, color: theme.palette.text.primary },
          showlegend: false,
          paper_bgcolor: 'transparent',
          plot_bgcolor: theme.palette.background.paper,
          margin: { l: 20, r: 10, t: 10, b: 20 },
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
        } else if (currentName === 'nyquist') {
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
        } else {
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
        layout.autosize = true
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
  }, [chartRefs, datasets, previewData, theme, prevLengthsRef, isPolar])
}