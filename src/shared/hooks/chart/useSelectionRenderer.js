import { useEffect } from 'react'
import Plotly from 'plotly.js-dist'

export const useSelectionRenderer = (chartRef, datasets, selectedPoints, setSelectedPoints, handleSetDatasetSelected) => {
  useEffect(() => {
    const el = chartRef.current
    if (!el) return

    // Remove previous selection/highlight traces
    const removeIdx = el.data
      .map((t, i) =>
        t.name === 'Selected Points' || t.name === 'Highlight Range' ? i : -1
      )
      .filter(i => i >= 0)

    if (removeIdx.length) {
      Plotly.deleteTraces(el, removeIdx)
    }

    const toAdd = []

    // Draw selected points
    if (selectedPoints.length) {
      toAdd.push({
        x: selectedPoints.map(p => p.x),
        y: selectedPoints.map(p => p.y),
        mode: 'markers',
        marker: {
          size: 20,
          color: 'red',
          symbol: 'sphere',
        },
        name: 'Selected Points',
        showlegend: false,
      })
    }

    // Draw range if 2 points selected
    if (selectedPoints.length === 2) {
      const [p1, p2] = selectedPoints
      const ds = datasets[p1.dataset]?.data[0]

      if (ds) {
        const { x: xs, y: ys } = ds
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
            showlegend: false,
          })

          // Confirm selection and dataset
          setSelectedPoints(selectedPoints)
          handleSetDatasetSelected(p1.dataset)
        }
      }
    }

    if (toAdd.length) {
      Plotly.addTraces(el, toAdd)
    }
  }, [chartRef, datasets, selectedPoints, setSelectedPoints, handleSetDatasetSelected])
}