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
    switch (dataType) {
      case "cvw":
        return { x: ds.x || [], y: ds.y || [] }
      case "bodeMod":
        return { x: ds.omega || [], y: (ds.modZ || []).map(v => 20 * Math.log10(Math.max(v, 1e-12))) }
      case "bodeAng":
        return { x: ds.omega || [], y: ds.angZ || [] }
      case "nyquist":
        return {
          x: ds.omega || [],
          y: ds.realZ && ds.imagZ ? ds.realZ.map((_, i) => ({ re: ds.realZ[i], im: ds.imagZ[i] })) : []
        }
      default:
        return { x: [], y: [] }
    }
  }, [datasets, dataType])

  function rcFilter(data, xAxis, cutoff) {
    if (!data || data.length < 2) return []
    let filtered = [data[0]]
    for (let i = 1; i < data.length; i++) {
      const dt = xAxis[i] - xAxis[i - 1]
      const RC = 1 / (2 * Math.PI * cutoff)
      const alpha = dt / (RC + dt)
      filtered[i] = filtered[i - 1] + alpha * (data[i] - filtered[i - 1])
    }
    return filtered
  }

  useEffect(() => {
    if (!visible.x.length || !visible.y.length) {
      setPreviewFilter({ x: [], y: [] })
      return
    }

    let xOut = [...visible.x]
    let yOut = []

    if (dataType === "cvw") {
      const ds = datasets.find(d => d.visible)
      const { scanRate, step } = ds?.params || {}
      if (!scanRate || !step) return
      const fs = scanRate / step
      const xTime = visible.x.map((_, i) => i / fs)
      
      yOut = [...visible.y]
      for (let n = 0; n < order; n++) {
        yOut = rcFilter(yOut, xTime, cutoffFrequency)
      }

    } else if (dataType === "bodeMod" || dataType === "bodeAng") {
      
      yOut = [...visible.y]
      for (let n = 0; n < order; n++) {
        yOut = rcFilter(yOut, visible.x, cutoffFrequency)
      }

    } else if (dataType === "nyquist") {
      
      const reArr = visible.y.map(pt => pt.re)
      const imArr = visible.y.map(pt => pt.im)
      let reFilt = [...reArr]
      let imFilt = [...imArr]
      for (let n = 0; n < order; n++) {
        reFilt = rcFilter(reFilt, visible.x, cutoffFrequency)
        imFilt = rcFilter(imFilt, visible.x, cutoffFrequency)
      }
      xOut = reFilt
      yOut = imFilt
    }

    setPreviewFilter({ x: xOut, y: yOut })
  }, [cutoffFrequency, order, visible, setPreviewFilter, datasets, dataType])

  const handleCutoffChange = (_evt, newValue) => {
    const val = Array.isArray(newValue) ? newValue[0] : newValue
    setCutoffFrequency(val)
  }
  const handleOrderChange = (_evt, newValue) => {
    const val = Array.isArray(newValue) ? newValue[0] : newValue
    setOrder(Math.max(1, val))
  }

  return (
    <Box>
      <Box sx={{ mt: 1, p: 2, borderRadius: 1, backgroundColor: 'white', height: '100%' }}>
        <Stack spacing={3}>
          <Typography variant="h6" sx={{ fontSize: '1.125rem' }}>
            LowPass RC Filter
          </Typography>

          {/* Cutoff Frequency Slider */}
          <Box>
            <Typography variant="body2">Cutoff Frequency (Hz):</Typography>
            <Slider
              value={cutoffFrequency}
              onChange={handleCutoffChange}
              min={dataType === 'cvw' ? 1 : 0.1}
              max={dataType === 'cvw' ? 100 : (visible.x.length ? Math.max(...visible.x) : 100)}
              step={dataType === 'cvw' ? 1 : 0.1}
              valueLabelDisplay="auto"
            />
            <TextField
              label="Cutoff"
              type="number"
              value={cutoffFrequency}
              onChange={(e) => setCutoffFrequency(parseFloat(e.target.value) || 0.1)}
              InputProps={{ endAdornment: <InputAdornment position="end">Hz</InputAdornment> }}
              size="small"
              fullWidth
            />
          </Box>

          {/* Order Slider */}
          <Box>
            <Typography variant="body2">Ordem do filtro (n):</Typography>
            <Slider
              value={order}
              onChange={handleOrderChange}
              min={1}
              max={10}
              step={1}
              marks={[{ value: 1, label: '1' }, { value: 5, label: '5' }, { value: 10, label: '10' }]}
              valueLabelDisplay="auto"
            />
          </Box>

        </Stack>
      </Box>
    </Box>
  )
}