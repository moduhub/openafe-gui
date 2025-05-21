import { useEffect } from 'react'
import Plotly from 'plotly.js-dist'

export const useExtendTraces = (chartRef, datasets, prevLengths) => {
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

        Plotly.extendTraces(el, { x: [newX], y: [newY] }, [traceIndex])
        prevLengths.current[key] = xArr.length
      }
    })
  }, [chartRef, datasets, prevLengths])
}