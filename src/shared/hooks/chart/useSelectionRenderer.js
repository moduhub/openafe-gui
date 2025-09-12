import { useEffect } from 'react'
import Plotly from 'plotly.js-dist'

/**
 * @brief Render selection highlights and highlight ranges on Plotly charts based on selected points.
 *
 * @param {React.RefObject|React.RefObject[]} chartRefs - Single or array of chart refs. For EIS charts array order is [bodeMod, bodeAng, nyquist].
 * @param {Array} datasets - Full datasets array used to resolve coordinates and series.
 * @param {(index:number) => void} handleSetDatasetSelected - Context handler to set currently selected dataset index.
 * @param {Array} selectedPoints - Array of selected point objects (up to two). EIS points include {ref, dataset, index, ...}.
 * @param {(points: any[]) => void} setSelectedPoints - State setter to update selected points (used to normalize selection when a valid range is chosen).
 * @param {boolean} isPolar - Whether Nyquist rendering and selection should be handled in polar coordinates.
 *
 * Behavior:
 * - Removes previous 'Selected Points' and 'Highlight Range' traces before adding new selection traces.
 * - For CVW: displays markers for selected points and a highlighted line range between two indices.
 * - For EIS: supports Bode magnitude/phase and Nyquist (polar or rectangular) selection markers and ranges.
 * - Uses Plotly.addTraces and Plotly.deleteTraces for selection overlays.
 * - Ensures dataset selection state is synchronized when valid selections exist.
 */
export const useSelectionRenderer = (
  chartRefs,
  datasets, handleSetDatasetSelected,
  selectedPoints, setSelectedPoints,
  isPolar
) => {
  useEffect(() => {
    const refs = Array.isArray(chartRefs) ? chartRefs : [chartRefs]
    const type = selectedPoints.length && selectedPoints[0].type
    const isEIS = type === "EIS"
    const isVoltammetry = (type === "CVW" || type === "DPV" || type === "SWV")

    const removeSelectionTraces = (el) => {
      if (!el || !el.data) return

      const removeIdx = el.data
        .map((t, i) =>
          t.name === 'Selected Points' || t.name === 'Highlight Range' ? i : -1
        )
        .filter(i => i >= 0)
      if (removeIdx.length) {
        Plotly.deleteTraces(el, removeIdx)
      }
    }

    if (!selectedPoints.length) {
      refs.forEach(ref => {
        const el = ref.current
        if (el) removeSelectionTraces(el)
      })
      return
    }

    if (isVoltammetry) {
      refs.forEach(ref => {
        const el = ref.current
        if (!el) return
        removeSelectionTraces(el)

        const toAdd = []

        if (selectedPoints.length) {
          const x_ = selectedPoints.map(p =>
            datasets[p.dataset]?.data[0]?.x[p.index]
          )
          const y_ = selectedPoints.map(p =>
            datasets[p.dataset]?.data[0]?.y[p.index]
          )

          toAdd.push({
            x: x_,
            y: y_,
            mode: 'markers',
            marker: { size: 20, color: 'red', symbol: 'sphere' },
            name: 'Selected Points',
            showlegend: false,
          })
        }

        if (selectedPoints.length === 2) {
          const [p1, p2] = selectedPoints
          const ds = datasets[p1.dataset]?.data[0]
          if (ds) {
            const { x: xs, y: ys } = ds
            if (p1.index >= 0 && p2.index >= 0) {
              const [s, e] = [Math.min(p1.index, p2.index), Math.max(p1.index, p2.index)]
              toAdd.push({
                x: xs.slice(s, e + 1),
                y: ys.slice(s, e + 1),
                mode: 'lines',
                line: { width: 4, color: 'red' },
                name: 'Highlight Range',
                showlegend: false,
              })
              setSelectedPoints(selectedPoints)
              handleSetDatasetSelected(p1.dataset)
            }
          }
        }

        if (toAdd.length) 
          Plotly.addTraces(el, toAdd)
      })
    } 

    else if (isEIS) {
      // EIS: refs[0]=bodeMod, refs[1]=bodeAng, refs[2]=nyquist
      const [bodeModRef, bodeAngRef, nyquistRef] = refs
      const p = selectedPoints[0]
      const ds = datasets[p.dataset]?.data[0]

      if (!ds) return

      // Bode |Z| (omega vs modZ)
      if (bodeModRef?.current) {
        removeSelectionTraces(bodeModRef.current)
        const toAdd = []

        if (selectedPoints.length) {
          const x_ = selectedPoints.map(pt => datasets[pt.dataset]?.data[0]?.omega[pt.index])
          const y_ = selectedPoints.map(pt => {
            const v = datasets[pt.dataset]?.data[0]?.modZ[pt.index]
            return 20 * Math.log10(v > 0 ? v : 1e-12)
          })  // db points
          toAdd.push({
            x: x_,
            y: y_,
            mode: 'markers',
            marker: { size: 20, color: 'red', symbol: 'sphere' },
            name: 'Selected Points',
            showlegend: false,
          })
        }
        if (selectedPoints.length === 2) {
          const [p1, p2] = selectedPoints
          const ds = datasets[p1.dataset]?.data[0]
          const { omega: xs, modZ: ys } = ds
          if (p1.index >= 0 && p2.index >= 0) {
              const [s, e] = [Math.min(p1.index, p2.index), Math.max(p1.index, p2.index)]
              toAdd.push({
                x: xs.slice(s, e + 1),
                y: ys.slice(s, e + 1).map(v => 20 * Math.log10(v > 0 ? v : 1e-12)), // db lines
                mode: 'lines',
                line: { width: 4, color: 'red' },
                name: 'Highlight Range',
                showlegend: false,
              })
              setSelectedPoints(selectedPoints)
              handleSetDatasetSelected(p1.dataset)
            }
        }
        if(toAdd.length)
          Plotly.addTraces(bodeModRef.current,toAdd)
      }

      // Bode angZ (omega vs angZ)
      if (bodeAngRef?.current) {
        removeSelectionTraces(bodeAngRef.current)
        const toAdd = []

        if (selectedPoints.length) {
          const x_ = selectedPoints.map(pt => datasets[pt.dataset]?.data[0]?.omega[pt.index])
          const y_ = selectedPoints.map(pt => datasets[pt.dataset]?.data[0]?.angZ[pt.index])
          toAdd.push({
            x: x_,
            y: y_,
            mode: 'markers',
            marker: { size: 20, color: 'red', symbol: 'sphere' },
            name: 'Selected Points',
            showlegend: false,
          })
        }
        if (selectedPoints.length === 2) {
          const [p1, p2] = selectedPoints
          const ds = datasets[p1.dataset]?.data[0]
          const { omega: xs, angZ: ys } = ds
          if (p1.index >= 0 && p2.index >= 0) {
              const [s, e] = [Math.min(p1.index, p2.index), Math.max(p1.index, p2.index)]
              toAdd.push({
                x: xs.slice(s, e + 1),
                y: ys.slice(s, e + 1),
                mode: 'lines',
                line: { width: 4, color: 'red' },
                name: 'Highlight Range',
                showlegend: false,
              })
              setSelectedPoints(selectedPoints)
              handleSetDatasetSelected(p1.dataset)
            }
        }
        if(toAdd.length)
          Plotly.addTraces(bodeAngRef.current,toAdd)
      }

      // Nyquist (realZ vs imagZ)
      if (nyquistRef?.current) {
        removeSelectionTraces(nyquistRef.current)
        const toAdd = []

        const isPolarNyquist = isPolar

        if (selectedPoints.length) {
          if (isPolarNyquist) {
            // Polar: r/theta
            const r_ = selectedPoints.map(pt => {
              const real = datasets[pt.dataset]?.data[0]?.realZ?.[pt.index]
              const imag = datasets[pt.dataset]?.data[0]?.imagZ?.[pt.index]
              return real !== undefined && imag !== undefined
                ? Math.sqrt(real * real + imag * imag)
                : undefined
            })
            const theta_ = selectedPoints.map(pt => {
              const real = datasets[pt.dataset]?.data[0]?.realZ?.[pt.index]
              const imag = datasets[pt.dataset]?.data[0]?.imagZ?.[pt.index]
              return real !== undefined && imag !== undefined
                ? (Math.atan2(imag, real) * 180 / Math.PI)
                : undefined
            })
            toAdd.push({
              r: r_,
              theta: theta_,
              mode: 'markers',
              marker: { size: 20, color: 'red', symbol: 'circle' },
              name: 'Selected Points',
              showlegend: false,
              type: 'scatterpolar'
            })
          } else {
            // Retangular: x/y
            const x_ = selectedPoints.map(pt => datasets[pt.dataset]?.data[0]?.realZ?.[pt.index])
            const y_ = selectedPoints.map(pt => datasets[pt.dataset]?.data[0]?.imagZ?.[pt.index])
            toAdd.push({
              x: x_,
              y: y_,
              mode: 'markers',
              marker: { size: 20, color: 'red', symbol: 'sphere' },
              name: 'Selected Points',
              showlegend: false,
            })
          }
        }
        if (selectedPoints.length === 2) {
          const [p1, p2] = selectedPoints
          const ds = datasets[p1.dataset]?.data[0]
          if (isPolarNyquist) {
            const realZ = ds.realZ
            const imagZ = ds.imagZ
            if (Array.isArray(realZ) && Array.isArray(imagZ) && p1.index >= 0 && p2.index >= 0) {
              const [s, e] = [Math.min(p1.index, p2.index), Math.max(p1.index, p2.index)]
              const rLine = []
              const thetaLine = []
              for (let i = s; i <= e; i++) {
                const real = realZ[i]
                const imag = imagZ[i]
                rLine.push(Math.sqrt(real * real + imag * imag))
                thetaLine.push(Math.atan2(imag, real) * 180 / Math.PI)
              }
              toAdd.push({
                r: rLine,
                theta: thetaLine,
                mode: 'lines',
                line: { width: 4, color: 'red' },
                name: 'Highlight Range',
                showlegend: false,
                type: 'scatterpolar'
              })
              setSelectedPoints(selectedPoints)
              handleSetDatasetSelected(p1.dataset)
            }
          } else {
            const { realZ: xs, imagZ: ys } = ds
            if (p1.index >= 0 && p2.index >= 0) {
              const [s, e] = [Math.min(p1.index, p2.index), Math.max(p1.index, p2.index)]
              toAdd.push({
                x: xs.slice(s, e + 1),
                y: ys.slice(s, e + 1),
                mode: 'lines',
                line: { width: 4, color: 'red' },
                name: 'Highlight Range',
                showlegend: false,
              })
              setSelectedPoints(selectedPoints)
              handleSetDatasetSelected(p1.dataset)
            }
          }
        }
        if(toAdd.length)
          Plotly.addTraces(nyquistRef.current,toAdd)
      }
    }
    
  }, [chartRefs, datasets, selectedPoints, setSelectedPoints, handleSetDatasetSelected])
}