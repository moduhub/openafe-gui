import { useEffect } from 'react'
import Plotly from 'plotly.js-dist'

/**
 * @brief Incrementally extend Plotly traces for a single chart ref when new data arrives.
 *
 * @param {React.RefObject} chartRef - Reference to the Plotly DOM element.
 * @param {Array} datasets - Array of dataset objects used to obtain x/y arrays.
 * @param {React.MutableRefObject<Object>} prevLengths - Mutable ref that stores previous lengths per dataset name (updated in-place).
 *
 * Behavior:
 * - For each visible dataset, compares current data length with prevLengths.current[key].
 * - Calls Plotly.extendTraces to append only the new points to the appropriate trace index.
 * - Updates prevLengths.current for each dataset that had appended data.
 *
 * Notes:
 * - Does nothing if chartRef is not mounted.
 */
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