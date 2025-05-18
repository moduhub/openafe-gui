import { useEffect, useState, useMemo } from "react"
import {
    Box,
    Stack,
    Typography,
    TextField,
    InputAdornment
} from '@mui/material'

import { useDatasetsContext } from '../../contexts'

/**
 * A component that applies a band-pass filter to the currently visible dataset
 * and previews the filtered signal. It allows users to adjust the lower and upper
 * cutoff frequencies, then computes the filtered result using a simple IIR filter model
 *
 * @param {(filtered: { x: number[], y: number[] }) => void} setPreviewFilter - 
 *        Callback to provide the filtered signal for preview.
 *
 * @returns {JSX.Element}
 */
export const BandPass = ({ setPreviewFilter }) => {
    const { datasets } = useDatasetsContext()
    const [lowCutoffFrequency, setLowCutoffFrequency] = useState(10)
    const [highCutoffFrequency, setHighCutoffFrequency] = useState(50)
   
    const calculateBandPass = (x, y, lowCutoffFreq, highCutoffFreq, fs) => {
        const result = { x: [], y: [] }
        const dt = 1 / fs
        
        const RC_high = 1 / (2 * Math.PI * lowCutoffFreq)
        const alpha_high = dt / (RC_high + dt)
        
        const RC_low = 1 / (2 * Math.PI * highCutoffFreq)
        const alpha_low = RC_low / (RC_low + dt)
        
        result.x = [...x]
        result.y = new Array(y.length)
        
        let lowPassResult = new Array(y.length)
        lowPassResult[0] = y[0]
        
        for (let i = 1; i < y.length; i++) {
            lowPassResult[i] = lowPassResult[i-1] + alpha_high * (y[i] - lowPassResult[i-1])
        }
        
        result.y[0] = lowPassResult[0]
        
        for (let i = 1; i < y.length; i++) {
            result.y[i] = alpha_low * (result.y[i-1] + lowPassResult[i] - lowPassResult[i-1])
        }
        
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

        const filteredSignal = calculateBandPass(
            visibleDataset.data[0].x,
            visibleDataset.data[0].y,
            lowCutoffFrequency,
            highCutoffFrequency,
            fs
        )

        setPreviewFilter(filteredSignal)
    }, [lowCutoffFrequency, highCutoffFrequency, visibleDataset, setPreviewFilter])

    return(
        <Box>
            <Box sx={{ mt: 1, p: 2, boxShadow: 1, borderRadius: 1 }}>
                <Stack spacing={2}>
                    <Typography variant="h6" sx={{ fontSize: '1.125rem' }}>
                        Bandpass Filter
                    </Typography>

                    <Box>
                        <Typography variant="body2" gutterBottom>
                            Lower Cut (Hz):
                        </Typography>
                        <TextField
                            label="Lower Cut Frequency"
                            type="number"
                            value={lowCutoffFrequency}
                            onChange={(e) => {
                                const value = Math.max(1, Math.min(Number(e.target.value), highCutoffFrequency))
                                setLowCutoffFrequency(value)
                            }}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">Hz</InputAdornment>,
                                inputProps: { min: 1 }
                            }}
                            size="small"
                            fullWidth
                        />
                    </Box>

                    <Box>
                        <Typography variant="body2" gutterBottom>
                            Higher cut (Hz):
                        </Typography>
                        <TextField
                            label="Higher Cutoff Frequency"
                            type="number"
                            value={highCutoffFrequency}
                            onChange={(e) => {
                                const value = Math.max(lowCutoffFrequency, Math.min(Number(e.target.value), 100))
                                setHighCutoffFrequency(value)
                            }}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">Hz</InputAdornment>,
                                inputProps: { min: 1 }
                            }}
                            size="small"
                            fullWidth
                        />
                    </Box>
                </Stack>
            </Box>
        </Box>
    )
}