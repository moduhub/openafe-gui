import { useEffect, useState, useMemo } from "react"
import {
    Typography,
    Slider
} from '@mui/material'

import { useDatasetsContext } from '../../contexts'

export const HighPass = ({posSelectdataset, setArrayFiltered}) => {
    const { datasets } = useDatasetsContext()
    const [cutoffFrequency, setCutoffFrequency] = useState(50)
    
    const params = useMemo(() => datasets[posSelectdataset]?.params, [datasets, posSelectdataset])
    const samplingRate = useMemo(() => params ? params.scanRate / params.step : 1, [params])

    const calculateHighPass = (x, y, cutoffFreq, fs) => {
        const result = { x: [], y: [] }
        const dt = 1 / fs
        const RC = 1 / (2 * Math.PI * cutoffFreq)
        const alpha = RC / (RC + dt)
        
        result.x = [...x]
        result.y = new Array(y.length)
        result.y[0] = y[0]
        
        for (let i = 1; i < y.length; i++) {
            result.y[i] = alpha * (result.y[i-1] + y[i] - y[i-1])
        }
        
        return result
    }

    const handleFrequencyChange = (_, newValue) => {
        setCutoffFrequency(newValue)
    }

    useEffect(() => {
        if (!datasets[posSelectdataset]?.data?.[0]) {
            setArrayFiltered({ x: [], y: [] })
            return
        }

        const dataset = datasets[posSelectdataset].data[0]
        if (!dataset?.x?.length || !dataset?.y?.length) {
            setArrayFiltered({ x: [], y: [] })
            return
        }

        const filteredSignal = calculateHighPass(
            dataset.x, 
            dataset.y, 
            cutoffFrequency, 
            samplingRate
        )
        setArrayFiltered(filteredSignal)

    }, [cutoffFrequency, posSelectdataset, datasets])

    return(
        <>
            <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                Configurações do Filtro Passa-Alta
            </Typography>
            <Typography variant="body2">
                Frequência de Corte (Hz): {cutoffFrequency}
            </Typography>
            <Slider
                value={cutoffFrequency}
                onChange={handleFrequencyChange}
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={100}
            />
        </>
    )
}