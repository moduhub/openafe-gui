import { useEffect } from 'react'
import Plotly from 'plotly.js-dist'

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