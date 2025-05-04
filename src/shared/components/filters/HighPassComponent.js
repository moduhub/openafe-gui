import React from "react"
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

export const HighPass = ({ setPreviewFilter }) => {
    const { datasets } = useDatasetsContext()
    const [cutoffFrequency, setCutoffFrequency] = useState(50)
    
    const calculateHighPass = (x, y, cutoffFreq, fs) => {
        const result = { x: [], y: [] }
        const dt = 1 / fs
        const RC = 1 / (2 * Math.PI * cutoffFreq)
        const alpha = RC / (RC + dt)
        
        result.x = [...x]
        result.y = new Array(y.length)
        result.y[0] = y[0]
        
        for (let i = 1; i < y.length; i++) 
            result.y[i] = alpha * (result.y[i-1] + y[i] - y[i-1])
        
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

        const filteredSignal = calculateHighPass(
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
            Filtro Passa-Alta
            </Typography>

            <Box>
            <Typography variant="body2" gutterBottom>
                Frequência de Corte (Hz): 
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
            label="Frequência de Corte"
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