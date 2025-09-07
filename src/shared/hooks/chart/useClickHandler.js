import { useEffect } from 'react'
import { useDatasetsContext } from '../../contexts'

/**
 * @brief Handle Plotly click events across one or more chart refs and update selected points.
 *
 * @param {Array<{ref: React.RefObject, name: string}>} chartRefsWithNames - Array of chart refs with logical names (e.g. [{ref, name: 'bodeMod'}]).
 * @param {(points: any[]) => void} setSelectedPoints - State setter to store selected points (keeps up to two points).
 * @param {object} theme - MUI theme object used to pick default colors.
 * @param {boolean} isPolar - Whether the target charts render polar data (affects coordinate mapping).
 *
 * Behavior:
 * - Attaches a 'plotly_click' handler to each provided chart element.
 * - When a point is clicked it maps the Plotly point to the application dataset/index and composes a point object:
 *   { dataset, type, color, index, ref, x/y or theta/r }.
 * - Prevents clicks on interpolation traces and avoids duplicate selections.
 * - Updates global selected dataset state via datasets context helpers.
 *
 * Notes:
 * - The hook cleans up listeners on unmount or when inputs change.
 */
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
