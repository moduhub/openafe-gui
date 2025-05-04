import React, { useState, useEffect, useMemo } from "react"
import {
  Box,
  Stack,
  Typography,
  Slider,
  TextField,
  InputAdornment
} from '@mui/material'

import { useDatasetsContext } from '../../contexts'

export const MovingAverage = ({ setPreviewFilter }) => {
  const { datasets } = useDatasetsContext()
  const [windowSize, setWindowSize] = useState(3)

  const calculateMovingAverage = (x, y, window) => {
    const result = { x: [], y: [] }
    const half = Math.floor(window / 2)
    for (let i = 0; i < y.length; i++) {
      const start = Math.max(0, i - half)
      const end = Math.min(y.length, i + half + 1)
      const slice = y.slice(start, end)
      const avg = slice.reduce((sum, v) => sum + v, 0) / slice.length
      result.x.push(x[i])
      result.y.push(avg)
    }
    return result
  }

  const visible = useMemo(
    () => datasets.find(d => d.visible)?.data?.[0] || { x: [], y: [] },
    [datasets]
  )

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

    const filtered = calculateMovingAverage(visible.x, visible.y, adjusted)
    setPreviewFilter(filtered)
  }, [windowSize, visible, maxWindow, setPreviewFilter])

  const handleSlider = (_e, val) => {
    setWindowSize(Math.min(Array.isArray(val) ? val[0] : val, maxWindow))
  }

  return (
    <Box>
      <Box sx={{ mt: 1, p: 2, boxShadow: 1, borderRadius: 1 }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontSize: '1.125rem' }}>
            Filtro Média Móvel
          </Typography>

          <Box>
            <Typography variant="body2" gutterBottom>
              Tamanho da janela: {windowSize}
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
