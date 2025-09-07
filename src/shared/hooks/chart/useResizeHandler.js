import { useEffect } from 'react'
import Plotly from 'plotly.js-dist'

/**
 * @brief Attach a window resize listener that resizes a Plotly plot when the window changes.
 *
 * @param {React.RefObject} chartRef - Plotly DOM ref to resize via Plotly.Plots.resize.
 *
 * Behavior:
 * - Adds a 'resize' event listener on mount and removes it on cleanup.
 * - On resize, calls Plotly.Plots.resize if the plot has been initialized.
 */
export const useResizeHandler = (chartRef) => {
  useEffect(() => {
    const handleResize = () => {
      const el = chartRef.current
      if (el && el._fullLayout) Plotly.Plots.resize(el)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [chartRef])
}