import { useEffect, useState, useMemo } from "react"
import {
  Box,
  Stack,
  Typography,
  Slider,
  TextField,
  InputAdornment
} from '@mui/material'

import { useDatasetsContext } from '../../contexts'

/**
 * A component that applies a low-pass filter to the currently visible dataset
 * and previews the filtered result. Users can control the cutoff frequency 
 * using either a slider or a numeric input field
 *
 * @param {(filtered: { x: number[], y: number[] }) => void} setPreviewFilter - 
 *        Callback to update the filtered signal preview
 *
 * @returns {JSX.Element}
 */
export const LowPass = ({ setPreviewFilter }) => {
  const { datasets } = useDatasetsContext()
  const [cutoffFrequency, setCutoffFrequency] = useState(50)

  const calculateLowPass = (x, y, cutoffFreq, fs) => {
    const result = { x: [...x], y: [] }
    const dt = 1 / fs
    const RC = 1 / (2 * Math.PI * cutoffFreq)
    const alpha = dt / (RC + dt)

    result.y[0] = y[0]
    for (let i = 1; i < y.length; i++)
      result.y[i] = result.y[i-1] + alpha * (y[i] - result.y[i-1])

    return result
  }

  const visibleDataset = useMemo(
    () => datasets.find(d => d.visible),
    [datasets]
  )

  useEffect(() => {
    if (!visibleDataset?.data?.[0]?.x?.length || !visibleDataset?.data?.[0]?.y?.length) {
      setPreviewFilter({ x: [], y: [] })
      return
    }
    const { scanRate, step } = visibleDataset.params || {}
    if (!scanRate || !step) return

    const fs = scanRate / step

    const filteredSignal = calculateLowPass(
      visibleDataset.data[0].x,
      visibleDataset.data[0].y,
      cutoffFrequency,
      fs
    )
    
    setPreviewFilter(filteredSignal)
  }, [cutoffFrequency, visibleDataset, setPreviewFilter])

  const handleSliderChange = (_evt, newValue) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue
    setCutoffFrequency(value)
  }

  return (
    <Box>
      <Box sx={{ mt: 1, p: 2, boxShadow: 1, borderRadius: 1 }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontSize: '1.125rem' }}>
            LowPass Filter
          </Typography>

          <Box>
            <Typography variant="body2" gutterBottom>
              Cutoff Frequency (Hz): 
            </Typography>
            <Slider
              value={cutoffFrequency}
              onChange={handleSliderChange}
              min={1}
              max={100}
              step={1}
              marks={[
                { value: 1, label: '1Hz' },
                { value: 50, label: '50Hz' },
                { value: 100, label: '100Hz' },
              ]}
              valueLabelDisplay="auto"
            />
          </Box>

          <TextField
            label="Cutoff Frequency"
            type="number"
            value={cutoffFrequency}
            onChange={(e) => {
              const value = Math.max(1, Number(e.target.value))
              setCutoffFrequency(value)
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">Hz</InputAdornment>,
              inputProps: { min: 1 }
            }}
            size="small"
            fullWidth
          />
        </Stack>
      </Box>
    </Box>
  )
}