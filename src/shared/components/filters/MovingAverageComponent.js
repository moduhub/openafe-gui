import { useState, useEffect, useMemo } from "react"
import {
  Box,
  Stack,
  Typography,
  Slider,
} from '@mui/material'

import { useDatasetsContext } from '../../contexts'

/**
 * @brief A component that applies a moving average filter to the visible dataset and
 * previews the filtered result. Users can adjust the window size using a slider
 *
 * @param {(filtered: { x: number[], y: number[] }) => void} setPreviewFilter -
 *        Callback to update the filtered signal preview.
 * @param {string} dataType - "cvw", "bodeMod", "bodeAng", "nyquist"
 *
 * Behavior:
 * - The moving average filter smooths the data by averaging points within a specified window size.
 * - The window size can be adjusted via a slider, with a maximum size limited by the dataset length.
 */
export const MovingAverage = ({ setPreviewFilter, dataType = "cvw" }) => {
  const { datasets } = useDatasetsContext()
  const [windowSize, setWindowSize] = useState(3)

  const visible = useMemo(() => {
    const ds = datasets.find(d => d.visible)?.data?.[0]
    if (!ds) return { x: [], y: [] }
    if (dataType === "cvw") return { x: ds.x || [], y: ds.y || [] }
    if (dataType === "bodeMod") return { x: ds.omega || [], y: ds.modZ || [] }
    if (dataType === "bodeAng") return { x: ds.omega || [], y: ds.angZ || [] }
    if (dataType === "nyquist") return { x: ds.realZ || [], y: ds.imagZ || [] }
    return { x: [], y: [] }
  }, [datasets, dataType])

  const maxWindow = useMemo(
    () => Math.min(21, visible.x.length || 21),
    [visible.x.length]
  )

  useEffect(() => {
    if (!visible.x.length || !visible.y.length) {
      setPreviewFilter({ x: [], y: [] })
      return
    }

    const adjusted = Math.min(windowSize, maxWindow)
    if (adjusted !== windowSize) {
      setWindowSize(adjusted)
      return
    }

    const result = { x: [], y: [] }
    const half = Math.floor(adjusted / 2)
    for (let i = 0; i < visible.y.length; i++) {
      const start = Math.max(0, i - half)
      const end = Math.min(visible.y.length, i + half + 1)
      const slice = visible.y.slice(start, end)
      const avg = slice.reduce((sum, v) => sum + v, 0) / slice.length
      result.x.push(visible.x[i])
      result.y.push(avg)
    }
    setPreviewFilter(result)
  }, [windowSize, visible, maxWindow, setPreviewFilter])

  const handleSlider = (_e, val) => {
    setWindowSize(Math.min(Array.isArray(val) ? val[0] : val, maxWindow))
  }

  return (
    <Box>
      <Box sx={{ mt: 1, p: 2, borderRadius: 1, backgroundColor: 'background.paper', color: 'text.primary', height: '100%' }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontSize: '1.125rem', color: 'text.primary' }}>
            MovingAverage Filter
          </Typography>

          <Box>
            <Typography variant="body2" gutterBottom>
              Window size: {windowSize}
            </Typography>
            <Slider
              value={windowSize}
              onChange={handleSlider}
              min={3}
              max={maxWindow}
              step={2}
              marks={[
                { value: 3, label: '3' },
                { value: Math.ceil(maxWindow / 2), label: `${Math.ceil(maxWindow / 2)}` },
                { value: maxWindow, label: `${maxWindow}` },
              ]}
              valueLabelDisplay="auto"
              disabled={maxWindow < 3}
            />
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}