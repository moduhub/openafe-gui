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
 * @brief A component that applies a low-pass RC filter of order n
 * in the domain of time (CVW) or frequency (Bode and Nyquist).
 *
 * @param {(filtered: { x: number[], y: number[] }) => void} setPreviewFilter
 * @param {string} dataType - "cvw", "bodeMod", "bodeAng" ou "nyquist"
 * 
 * Behavior:
 * - For CVW data, the filter is applied in the time domain using the scan rate and step size from dataset parameters.
 * - For EIS data (Bode and Nyquist), the filter is applied in the frequency domain.
 */
export const LowPass = ({ setPreviewFilter, dataType = "cvw" }) => {
  const { datasets } = useDatasetsContext()
  const [cutoffFrequency, setCutoffFrequency] = useState(50)
  const [order, setOrder] = useState(1)

  const visible = useMemo(() => {
    const ds = datasets.find(d => d.visible)?.data?.[0]
    if (!ds) return { x: [], y: [] }
    if (dataType === "cvw") return { x: ds.x || [], y: ds.y || [] }
    if (dataType === "bodeMod") return { x: ds.omega || [], y: (ds.modZ || []).map(v => 20 * Math.log10(Math.max(v, 1e-12))) }
    if (dataType === "bodeAng") return { x: ds.omega || [], y: ds.angZ || [] }
    if (dataType === "nyquist") return { x: ds.realZ || [], y: ds.imagZ || [] }
    return { x: [], y: [] }
  }, [datasets, dataType])

  function estimateFs(x) {
    if (!x || x.length < 2) return 1
    let diffs = []
    for (let i = 1; i < x.length; i++) {
      diffs.push(Math.abs(x[i] - x[i - 1]))
    }
    const meanStep = diffs.reduce((a, b) => a + b, 0) / diffs.length
    return meanStep > 0 ? 1 / meanStep : 1
  }

  function rcFilter(y, xAxis, cutoff, fs = 1, order = 1) {
    if (!y || y.length < 2) return []
    let resultY = [...y]
    const RC = 1 / (2 * Math.PI * cutoff)
    const dt = fs > 0 ? 1 / fs : 1
    const alpha = dt / (RC + dt)

    for (let k = 0; k < Math.max(1, order); k++) {
      let filtered = []
      filtered[0] = resultY[0]
      for (let i = 1; i < resultY.length; i++) {
        filtered[i] = filtered[i - 1] + alpha * (resultY[i] - filtered[i - 1])
      }
      resultY = filtered
    }
    return resultY
  }

  useEffect(() => {
    if (!visible.x.length || !visible.y.length) {
      setPreviewFilter({ x: [], y: [] })
      return
    }

    let fs = 1
    if (dataType === "cvw") {
      const ds = datasets.find(d => d.visible)
      const { scanRate, step } = ds?.params || {}
      if (scanRate && step) fs = scanRate / step
    } else if (dataType === "bodeMod" || dataType === "bodeAng") {
      fs = estimateFs(visible.x)
    } else if (dataType === "nyquist") {
      const ds = datasets.find(d => d.visible)?.data?.[0]
      if (ds?.omega?.length > 1) fs = estimateFs(ds.omega)
      else fs = 1
    }

    let resultY
    if (dataType === "nyquist") {
      const realFiltered = rcFilter(visible.x, visible.x, cutoffFrequency, fs, order)
      const imagFiltered = rcFilter(visible.y, visible.y, cutoffFrequency, fs, order)
      setPreviewFilter({ x: realFiltered, y: imagFiltered })
    } else {
      resultY = rcFilter(visible.y, visible.x, cutoffFrequency, fs, order)
      setPreviewFilter({ x: [...visible.x], y: resultY })
    }
  }, [cutoffFrequency, order, visible, setPreviewFilter, datasets, dataType])

  const handleOrderChange = (_evt, newValue) => {
    const val = Array.isArray(newValue) ? newValue[0] : newValue
    setOrder(Math.max(1, val))
  }

  const handleSliderChange = (_evt, newValue) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue
    setCutoffFrequency(value)
  }

  const isEIS = dataType !== 'cvw'

  return (
    <Box>
      <Box sx={{ mt: 1, p: 2, borderRadius: 1, backgroundColor: 'white', height: '100%' }}>
        <Stack spacing={3}>
          <Typography variant="h6" sx={{ fontSize: '1.125rem' }}>
            LowPass RC Filter
          </Typography>

          {/* Cutoff Frequency Slider */}
          <Box width='98%'>
            <Typography variant="body2">Cutoff Frequency (Hz):</Typography>
            <Slider
              value={cutoffFrequency}
              onChange={handleSliderChange}
              min={isEIS ? 0.1 : 1}
              max={isEIS ? 10000 : 100}
              step={isEIS ? 0.1 : 1}
              valueLabelDisplay="auto"
            />
          </Box>
          <TextField
            label="Cutoff Frequency"
            type="number"
            value={cutoffFrequency}
            onChange={(e) => {
              const value = Math.max(isEIS ? 0.1 : 1, Number(e.target.value))
              setCutoffFrequency(value)
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">Hz</InputAdornment>,
              inputProps: { min: isEIS ? 0.1 : 1 }
            }}
            size="small"
            fullWidth
          />

          {/* Order Slider */}
          <Box>
            <Typography variant="body2">
              Filter order:
            </Typography>
            <Slider
              value={order}
              onChange={handleOrderChange}
              min={1}
              max={10}
              step={1}
              marks={[
                { value: 1, label: '1' },
                { value: 5, label: '5' },
                { value: 10, label: '10' },
              ]}
              valueLabelDisplay="auto"
            />
          </Box>

        </Stack>
      </Box>
    </Box>
  )
}