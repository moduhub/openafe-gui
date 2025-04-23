import React, { useEffect } from "react"
import {
    Typography,
    Slider
} from '@mui/material'

import { useDatasetsContext } from '../../contexts'

export const MovingAverage = ({ 
    windowSize, 
    onWindowSizeChange,
    setArrayFiltered 
}) => {
    const { datasets } = useDatasetsContext()

    const calculateMovingAverage = (x, y, windowSize) => {
        const result = { x: [], y: [] }
        for (let i = 0; i < y.length; i++) {
            const start = Math.max(0, i - Math.floor(windowSize / 2))
            const end = Math.min(y.length, i + Math.floor(windowSize / 2) + 1)
            const avg = y.slice(start, end).reduce((sum, val) => sum + val, 0) / (end - start)
            result.x.push(x[i])
            result.y.push(avg)
        }
        return result
    }

    useEffect(() => {
        const visibleDataset = datasets.find(d => d.visible)
        if (visibleDataset?.data?.[0]?.x && visibleDataset?.data?.[0]?.y) {
            const { x, y } = visibleDataset.data[0]
            if (x.length > 0 && y.length > 0) {
                const movingAveragePoints = calculateMovingAverage(x, y, windowSize)
                setArrayFiltered(movingAveragePoints)
            }
        } else {
            setArrayFiltered({ x: [], y: [] }) // Reset quando não há dados
        }
    }, [windowSize, datasets])

    return(
        <>
            <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                Configurações da Média Móvel
            </Typography>
            <Typography variant="body2">
                Tamanho da janela: {windowSize}
            </Typography>
            <Slider
                value={windowSize}
                onChange={(e, newValue) => onWindowSizeChange(newValue)}
                valueLabelDisplay="auto"
                step={1}
                marks
                min={3}
                max={10}
            />
        </>
    )
}