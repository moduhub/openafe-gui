import { useEffect } from 'react'

import { useDatasetsContext } from '../../contexts'

export const useClickHandler = (chartRef, setSelectedPoints, theme) => {
  const { 
    datasets, 
    handleSetDatasetSelected, handleSetIsDatasetSelected 
  } = useDatasetsContext()

  useEffect(() => {
    const el = chartRef.current
    if (!el) return

    const handleClick = (eventData) => {
      if (!eventData?.points?.length) return
      const pt = eventData.points[0]
      if (pt.data.name.startsWith('Interpolação')) return

      setSelectedPoints(prev => {
        let newPoints
        if (prev.length && prev[0].dataset !== pt.data.name) {
          newPoints = [{ x: pt.x, y: pt.y, dataset: pt.data.name, color: pt.fullData.line?.color || theme.palette.secondary.main }]
        } else {
          const dup = prev.some(p => p.x === pt.x && p.y === pt.y)
          if (!dup && prev.length < 2) {
            newPoints = [...prev, { x: pt.x, y: pt.y, dataset: pt.data.name, color: pt.fullData.line?.color || theme.palette.secondary.main }]
          } else {
            newPoints = prev
          }
        }

        if (pt.data.name !== -1) {
          handleSetDatasetSelected(pt.data.name)
          handleSetIsDatasetSelected(true)
        }
        return newPoints
      })
    }

    el.on('plotly_click', handleClick)
    return () => el.removeListener('plotly_click', handleClick)
  }, [chartRef, setSelectedPoints, theme])
}