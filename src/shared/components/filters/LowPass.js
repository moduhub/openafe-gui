import React, { useEffect } from "react"
import {
    Typography,
    Slider
} from '@mui/material'

import { useDatasetsContext } from '../../contexts'

export const LowPass = ({ 
    cutoffFrequency,
    onCutoffFrequencyChange,
    samplingRate = 1000, // Default sampling rate in Hz
    setArrayFiltered 
}) => {
    const { datasets } = useDatasetsContext()

    const calculateLowPass = (x, y, cutoffFreq, fs) => {
        const result = { x: [], y: [] }
        const dt = 1 / fs
        const RC = 1 / (2 * Math.PI * cutoffFreq)
        const alpha = dt / (RC + dt)
        
        result.x = [...x]
        result.y = new Array(y.length)
        result.y[0] = y[0]
        
        for (let i = 1; i < y.length; i++) {
            result.y[i] = result.y[i-1] + alpha * (y[i] - result.y[i-1])
        }
        
        return result
    }

    useEffect(() => {
        const visibleDataset = datasets.find(d => d.visible)
        if (visibleDataset?.data?.[0]?.x && visibleDataset?.data?.[0]?.y) {
            const { x, y } = visibleDataset.data[0]
            if (x.length > 0 && y.length > 0) {
                const filteredSignal = calculateLowPass(x, y, cutoffFrequency, samplingRate)
                setArrayFiltered(filteredSignal)
            }
        } else {
            setArrayFiltered({ x: [], y: [] })
        }
    }, [cutoffFrequency, datasets, samplingRate])

    return(
        <>
            <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                Configurações do Filtro Passa-Baixa
            </Typography>
            <Typography variant="body2">
                Frequência de Corte (Hz): {cutoffFrequency}
            </Typography>
            <Slider
                value={cutoffFrequency}
                onChange={(e, newValue) => onCutoffFrequencyChange(newValue)}
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={100}
            />
        </>
    )
}