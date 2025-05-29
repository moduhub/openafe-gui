import { useEffect } from 'react'
import Plotly from 'plotly.js-dist'

export const useSelectionRenderer = (
  chartRefs,
  datasets,
  selectedPoints,
  setSelectedPoints,
  handleSetDatasetSelected
) => {
  useEffect(() => {
    const refs = Array.isArray(chartRefs) ? chartRefs : [chartRefs]
    const isEIS = selectedPoints.length && selectedPoints[0].type === "EIS"
    const isCVW = selectedPoints.length && selectedPoints[0].type === "CVW"

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

    if (isCVW) {
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

        if (selectedPoints.length) {
          const x_ = selectedPoints.map(pt => datasets[pt.dataset]?.data[0]?.realZ[pt.index])
          const y_ = selectedPoints.map(pt => datasets[pt.dataset]?.data[0]?.imagZ[pt.index])
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
        if(toAdd.length)
          Plotly.addTraces(nyquistRef.current,toAdd)
      }
    }
    
  }, [chartRefs, datasets, selectedPoints, setSelectedPoints, handleSetDatasetSelected])
}