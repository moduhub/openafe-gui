import { useEffect, useState, useMemo } from "react"
import {
    Box,
    Stack,
    Typography,
    TextField,
    InputAdornment,
    Slider
} from '@mui/material'

import { useDatasetsContext } from '../../contexts'

/**
 * A component that applies a band-stop (notch) filter to the currently visible dataset
 * and previews the filtered signal. Users can configure the lower and upper cutoff frequencies,
 * and the component applies a simple IIR-based notch filter using a combination of low-pass
 * and high-pass filters
 *
 * @param {(filtered: { x: number[], y: number[] }) => void} setPreviewFilter - 
 *        Callback to provide the filtered signal for preview.
 *
 * @returns {JSX.Element}
 */
export const BandStop = ({ setPreviewFilter }) => {
    const { datasets } = useDatasetsContext()
    const [lowCutoffFrequency, setLowCutoffFrequency] = useState(10)
    const [highCutoffFrequency, setHighCutoffFrequency] = useState(50)
    const [order, setOrder] = useState(1) 

    const calculateBandStop = (x, y, lowCutoffFreq, highCutoffFreq, fs, order = 1) => {
        let lowPassed = [...y]
        let highPassed = [...y]

        for (let n = 0; n < order; n++) {
            const RC_low = 1 / (2 * Math.PI * lowCutoffFreq)
            const dt = 1 / fs
            const alpha_low = dt / (RC_low + dt)
            let filtered = []
            filtered[0] = lowPassed[0]
            for (let i = 1; i < lowPassed.length; i++) {
                filtered[i] = filtered[i-1] + alpha_low * (lowPassed[i] - filtered[i-1])
            }
            lowPassed = filtered
        }

        for (let n = 0; n < order; n++) {
            const RC_high = 1 / (2 * Math.PI * highCutoffFreq)
            const dt = 1 / fs
            const alpha_high = RC_high / (RC_high + dt)
            let filtered = []
            filtered[0] = highPassed[0]
            for (let i = 1; i < highPassed.length; i++) {
                filtered[i] = alpha_high * (filtered[i-1] + highPassed[i] - highPassed[i-1])
            }
            highPassed = filtered
        }

        const result = {
            x: [...x],
            y: lowPassed.map((low, i) => (low + highPassed[i]))
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

        const filteredSignal = calculateBandStop(
            visibleDataset.data[0].x,
            visibleDataset.data[0].y,
            lowCutoffFrequency,
            highCutoffFrequency,
            fs,
            order 
        )

        setPreviewFilter(filteredSignal)

    }, [lowCutoffFrequency, highCutoffFrequency, order, visibleDataset, setPreviewFilter])

    return (
        <Box>
            <Box sx={{ mt: 1, p: 2, borderRadius: 1, backgroundColor: 'white', height: '100%' }}>
                <Stack spacing={2}>
                    <Typography variant="h6" sx={{ fontSize: '1.125rem' }}>
                        BandStop Filter
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

                    <Box>
                        <Typography variant="body2">
                            Filter order:
                        </Typography>
                        <Slider
                            type="range"
                            min={1}
                            max={7}
                            step={1}
                            marks={[
                                { value: 1, label: '1' },
                                { value: 4, label: '4' },
                                { value: 7, label: '7' },
                            ]}
                            value={order}
                            onChange={e => setOrder(Number(e.target.value))}
                            style={{ width: '100%' }}
                        />
                    </Box>
                </Stack>
            </Box>
        </Box>
    )
}