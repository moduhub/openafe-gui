import React, { useEffect, useMemo } from "react"
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

    const visibleDataset = useMemo(() => 
        datasets.find(d => d.visible)?.data?.[0], 
        [datasets]
    )

    useEffect(() => {
        if (!visibleDataset?.x?.length || !visibleDataset?.y?.length) {
            setArrayFiltered({ x: [], y: [] })
            return
        }

        const movingAveragePoints = calculateMovingAverage(
            visibleDataset.x,
            visibleDataset.y,
            windowSize
        )
        setArrayFiltered(movingAveragePoints)
    }, [windowSize, visibleDataset, setArrayFiltered])

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