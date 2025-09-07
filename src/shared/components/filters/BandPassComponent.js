import { useEffect, useState, useMemo } from "react"
import { Box, Stack, Typography, Slider, TextField, InputAdornment } from '@mui/material'
import { useDatasetsContext } from '../../contexts'

/**
 * @briefComponent that applies a band-pass filter of order n, 
 * both in the time domain (CVW) and in the frequency domain (EIS).
 *
 * @param {(filtered: { x: number[], y: number[] }) => void} setPreviewFilter - Callback to set the filtered data for preview
 * @param {string} dataType - "cvw", "bodeMod", "bodeAng" ou "nyquist"
 * 
 * Behavior:
 * - For CVW data, the filter is applied in the time domain using the scan rate and step size from dataset parameters.
 * - For EIS data (Bode and Nyquist), the filter is applied in the frequency domain.
 */
export const BandPass = ({ setPreviewFilter, dataType = "cvw" }) => {
  const { datasets } = useDatasetsContext()
  const [lowCut, setLowCut] = useState(10)
  const [highCut, setHighCut] = useState(50)
  const [order, setOrder] = useState(1)

  const visible = useMemo(() => {
    const ds = datasets.find(d => d.visible)?.data?.[0]
    if (!ds) return { x: [], y: [] }
    switch (dataType) {
      case "cvw":
        return { x: ds.x || [], y: ds.y || [] }
      case "bodeMod":
        return { x: ds.omega || [], y: (ds.modZ || []).map(v => 20 * Math.log10(Math.max(v,1e-12))) }
      case "bodeAng":
        return { x: ds.omega || [], y: ds.angZ || [] }
      case "nyquist":
        return { x: ds.omega || [], y: (ds.realZ||[]).map((r,i)=>({ re: r, im: ds.imagZ?.[i]||0 })) }
      default:
        return { x: [], y: [] }
    }
  }, [datasets, dataType])

  function rcFilter(data, xAxis, cutoff, isHigh = false) {
    if (!data.length) return []
    const out = [data[0]]
    for (let i = 1; i < data.length; i++) {
      const dt = xAxis[i] - xAxis[i-1]
      const RC = 1/(2*Math.PI*cutoff)
      const alpha = isHigh ? RC/(RC+dt) : dt/(RC+dt)
      out[i] = isHigh
        ? alpha*(out[i-1] + data[i] - data[i-1])
        : out[i-1] + alpha*(data[i] - out[i-1])
    }
    return out
  }

  function estimateFs(x) {
    if (x.length<2) return 1
    const diffs = x.slice(1).map((v,i)=>Math.abs(v-x[i]))
    const mean = diffs.reduce((a,b)=>a+b,0)/diffs.length
    return mean?1/mean:1
  }

  useEffect(() => {
    if (!visible.x.length || !visible.y.length) {
      setPreviewFilter({ x: [], y: [] })
      return
    }

    let fs = 1
    if (dataType === 'cvw') {
      const ds = datasets.find(d=>d.visible)
      const { scanRate, step } = ds?.params||{}
      if (scanRate && step) fs = scanRate/step
    } else {
      fs = estimateFs(visible.x)
    }

    let xOut = [...visible.x]
    let yOut = []

    if (dataType === 'nyquist') {
      const re = visible.y.map(p=>p.re)
      const im = visible.y.map(p=>p.im)
      let reFilt = [...re]
      let imFilt = [...im]
      const axis = dataType==='cvw'? visible.x.map((_,i)=>i/fs): visible.x
      for (let n=0;n<order;n++) {
        reFilt = rcFilter(rcFilter(reFilt, axis, lowCut, true), axis, highCut, false)
        imFilt = rcFilter(rcFilter(imFilt, axis, lowCut, true), axis, highCut, false)
      }
      xOut = reFilt
      yOut = imFilt
    } else {
      const data = [...visible.y]
      let filt = [...data]
      const axis = dataType==='cvw'? visible.x.map((_,i)=>i/fs): visible.x
      for (let n=0;n<order;n++) {
        filt = rcFilter(filt, axis, lowCut, true)   // High-pass
        filt = rcFilter(filt, axis, highCut, false) // Low-pass
      }
      yOut = filt
    }

    setPreviewFilter({ x: xOut, y: yOut })
  }, [lowCut, highCut, order, visible, datasets, dataType, setPreviewFilter])

  const isEIS = dataType!=='cvw'

  return (
    <Box>
      <Box sx={{ mt:1, p:2, borderRadius:1, backgroundColor:'white', height:'100%' }}>
        <Stack spacing={3}>
          <Typography variant="h6">BandPass Filter</Typography>

          <Box>
            <Typography variant="body2">Low Cutoff (Hz):</Typography>
            <Slider
              value={lowCut}
              onChange={(_,v)=>setLowCut(v)}
              min={isEIS?0.1:1}
              max={isEIS?Math.max(...visible.x):100}
              step={isEIS?0.1:1}
              valueLabelDisplay="auto"
            />
            <TextField
              label="Low Cutoff"
              type="number"
              value={lowCut}
              onChange={e=>setLowCut(Number(e.target.value))}
              InputProps={{ endAdornment:<InputAdornment position="end">Hz</InputAdornment> }}
              size="small" fullWidth
            />
          </Box>

          <Box>
            <Typography variant="body2">High Cutoff (Hz):</Typography>
            <Slider
              value={highCut}
              onChange={(_,v)=>setHighCut(v)}
              min={lowCut+(isEIS?0.1:1)}
              max={isEIS?Math.max(...visible.x):100}
              step={isEIS?0.1:1}
              valueLabelDisplay="auto"
            />
            <TextField
              label="High Cutoff"
              type="number"
              value={highCut}
              onChange={e=>setHighCut(Number(e.target.value))}
              InputProps={{ endAdornment:<InputAdornment position="end">Hz</InputAdornment> }}
              size="small" fullWidth
            />
          </Box>

          <Box>
            <Typography variant="body2">Order (n):</Typography>
            <Slider
              value={order}
              onChange={(_,v)=>setOrder(v)}
              min={1} max={10} step={1}
              marks={[{value:1,label:'1'},{value:5,label:'5'},{value:10,label:'10'}]}
              valueLabelDisplay="auto"
            />
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}