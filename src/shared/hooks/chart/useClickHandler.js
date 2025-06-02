import { useEffect } from 'react'
import { useDatasetsContext } from '../../contexts'

export const useClickHandler = (
  chartRefsWithNames, // [{ ref, name }]
  setSelectedPoints,
  theme,
  isPolar
) => {
  const {
    datasets,
    handleSetDatasetSelected,
    handleSetIsDatasetSelected
  } = useDatasetsContext()

  useEffect(() => {
    const listeners = chartRefsWithNames
      .map(({ ref, name }) => ({ el: ref.current, name }))
      .filter(({ el }) => el)
      .map(({ el, name }) => {
        const handler = (eventData) => {
          if (!eventData?.points?.length) return
          const pt = eventData.points[0]
          if (!pt.data || !pt.data.name || !datasets[pt.data.name]) return
          if (pt.data.name.startsWith('Interpolação')) return

          setSelectedPoints(prev => {
            let newPoints

            const visibleDatasets = datasets.filter(ds => ds.visible)
            const datasetIndex = visibleDatasets[pt.curveNumber]
            if (!datasetIndex) return
            
            const isPolar = pt.data.type === 'scatterpolar'
            const datasetX = isPolar ? pt.data.theta : pt.data.x
            const datasetY = isPolar ? pt.data.r : pt.data.y

            const index = datasetX.findIndex(
              (xVal, i) =>
                (isPolar
                  ? (xVal === pt.theta && datasetY[i] === pt.r)
                  : (xVal === pt.x && datasetY[i] === pt.y)
                )
            )

            if (index === -1) return

            console.log(pt)

            const pointData = {
              dataset: datasets.findIndex(ds => ds.name === datasetIndex.name), // índice real no array global
              type: datasetIndex.type,
              color: pt.fullData.line?.color || theme.palette.secondary.main,
              index,
              ref: name,
              ...(isPolar
                ? { theta: pt.theta, r: pt.r }
                : { x: pt.x, y: pt.y }
              )
            }

            if (prev.length && prev[0].dataset !== pointData.dataset) {
              newPoints = [pointData]
            } else {
              const dup = prev.some(p =>
                isPolar
                  ? (p.theta === pt.theta && p.r === pt.r)
                  : (p.x === pt.x && p.y === pt.y)
              )
              if (!dup && prev.length < 2) {
                newPoints = [...prev, pointData]
              } else {
                newPoints = prev
              }
            }

            handleSetDatasetSelected(pointData.dataset)
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
  }, [
    chartRefsWithNames,
    setSelectedPoints,
    theme,
    handleSetDatasetSelected,
    handleSetIsDatasetSelected
  ])
}
