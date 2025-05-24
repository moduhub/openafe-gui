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
 * A component that applies a high-pass filter to the currently visible dataset
 * and previews the filtered signal. Users can configure the cutoff frequency
 * via a slider or text input. The filter uses a basic IIR implementation
 *
 * @param {(filtered: { x: number[], y: number[] }) => void} setPreviewFilter - 
 *        Callback to update the preview with the filtered signal.
 *
 * @returns {JSX.Element}
 */
export const HighPass = ({ setPreviewFilter }) => {
    const { datasets } = useDatasetsContext()
    const [cutoffFrequency, setCutoffFrequency] = useState(50)
    const [order, setOrder] = useState(1) 

    const calculateHighPass = (x, y, cutoffFreq, fs, order = 1) => {
        let resultY = [...y]
        for (let n = 0; n < order; n++) {
            const dt = 1 / fs
            const RC = 1 / (2 * Math.PI * cutoffFreq)
            const alpha = RC / (RC + dt)
            let filtered = new Array(resultY.length)
            filtered[0] = resultY[0]
            for (let i = 1; i < resultY.length; i++) {
                filtered[i] = alpha * (filtered[i-1] + resultY[i] - resultY[i-1])
            }
            resultY = filtered
        }
        return { x: [...x], y: resultY }
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
            fs,
            order
        )

        setPreviewFilter(filteredSignal)

    }, [cutoffFrequency, order, visibleDataset, setPreviewFilter])

    const handleSliderChange = (_evt, newValue) => {
        const value = Array.isArray(newValue) ? newValue[0] : newValue
        setCutoffFrequency(value)
    }

    const handleOrderChange = (_evt, newValue) => {
        const value = Array.isArray(newValue) ? newValue[0] : newValue
        setOrder(value)
    }

    return (
    <Box>
        <Box sx={{ mt: 1, p: 2, borderRadius: 1, backgroundColor: 'white', height: '100%' }}>
        <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontSize: '1.125rem' }}>
                HighPass Filter
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

            <Box>
                <Typography variant="body2">
                   Filter order:
                </Typography>
                <Slider
                    value={order}
                    onChange={handleOrderChange}
                    min={1}
                    max={7}
                    step={1}
                    marks={[
                        { value: 1, label: '1' },
                        { value: 4, label: '4' },
                        { value: 7, label: '7' },
                    ]}
                    valueLabelDisplay="auto"
                />
            </Box>
        </Stack>
        </Box>
    </Box>
    )
}