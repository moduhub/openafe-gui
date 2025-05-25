import { useEffect } from 'react'
import { useDatasetsContext } from '../../contexts'

export const useClickHandler = (chartRefs, setSelectedPoints, theme) => {

  const { 
    handleSetDatasetSelected, 
    handleSetIsDatasetSelected 
  } = useDatasetsContext()

  useEffect(() => {
    const listeners = chartRefs
      .map(ref => ref.current)
      .filter(el => el)
      .map(el => {
        const handler = (eventData) => {
          if (!eventData?.points?.length) return
          const pt = eventData.points[0]
          if (pt.data.name.startsWith('Interpolação')) return

          setSelectedPoints(prev => {
            let newPoints
            if (prev.length && prev[0].dataset !== pt.data.name) {
              newPoints = [{
                x: pt.x,
                y: pt.y,
                dataset: pt.data.name,
                color: pt.fullData.line?.color || theme.palette.secondary.main
              }]
            } else {
              const dup = prev.some(p => p.x === pt.x && p.y === pt.y)
              if (!dup && prev.length < 2) {
                newPoints = [
                  ...prev,
                  {
                    x: pt.x,
                    y: pt.y,
                    dataset: pt.data.name,
                    color: pt.fullData.line?.color || theme.palette.secondary.main
                  }
                ]
              } else {
                newPoints = prev
              }
            }

            handleSetDatasetSelected(pt.data.name)
            handleSetIsDatasetSelected(true)
            return newPoints
          })
        }

        el.on('plotly_click', handler)
        return { el, handler }
      })

    return () => {
      listeners.forEach(({ el, handler }) => {
        el.removeListener('plotly_click', handler)
      })
    }
  }, [chartRefs, setSelectedPoints, theme, handleSetDatasetSelected, handleSetIsDatasetSelected])
}
