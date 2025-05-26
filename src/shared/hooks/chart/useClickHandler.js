import { useEffect } from 'react'
import { useDatasetsContext } from '../../contexts'

export const useClickHandler = (chartRefs, setSelectedPoints, theme) => {

  const { 
    datasets,
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
            const datasetX = pt.data.x
            const datasetY = pt.data.y

            const index = datasetX.findIndex((xVal, i) => xVal === pt.x && datasetY[i] === pt.y)

            if (prev.length && prev[0].dataset !== pt.data.name) {
              newPoints = [{
                dataset: pt.data.name,
                type: datasets[pt.data.name].type,
                color: pt.fullData.line?.color || theme.palette.secondary.main,
                index: index
              }]
            } else {
              const dup = prev.some(p => p.x === pt.x && p.y === pt.y)
              if (!dup && prev.length < 2) {
                newPoints = [
                  ...prev,
                  {
                    dataset: pt.data.name,
                    type: datasets[pt.data.name].type,
                    color: pt.fullData.line?.color || theme.palette.secondary.main,
                    index: index
                  }
                ]
              } else {
                newPoints = prev
              }
            }

            handleSetDatasetSelected(pt.data.name)
            handleSetIsDatasetSelected(true)

            console.log(newPoints)            
            
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
