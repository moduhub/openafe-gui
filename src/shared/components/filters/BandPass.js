import { useEffect, useState, useMemo } from "react"
import {
    Typography,
    Slider,
    Stack
} from '@mui/material'

import { useDatasetsContext } from '../../contexts'

export const BandPass = ({posSelectdataset, setArrayFiltered}) => {
    const { datasets } = useDatasetsContext()
    const [lowCutoffFrequency, setLowCutoffFrequency] = useState(10)
    const [highCutoffFrequency, setHighCutoffFrequency] = useState(50)
    
    const params = useMemo(() => datasets[posSelectdataset]?.params, [datasets, posSelectdataset])
    const samplingRate = useMemo(() => params ? params.scanRate / params.step : 1, [params])

    const calculateBandPass = (x, y, lowCutoffFreq, highCutoffFreq, fs) => {
        const result = { x: [], y: [] }
        const dt = 1 / fs
        
        // Configuração do filtro passa-baixa
        const RC_high = 1 / (2 * Math.PI * lowCutoffFreq)
        const alpha_high = dt / (RC_high + dt)
        
        // Configuração do filtro passa-alta
        const RC_low = 1 / (2 * Math.PI * highCutoffFreq)
        const alpha_low = RC_low / (RC_low + dt)
        
        result.x = [...x]
        result.y = new Array(y.length)
        
        // Primeiro aplicamos o filtro passa-baixa
        let lowPassResult = new Array(y.length)
        lowPassResult[0] = y[0]
        
        for (let i = 1; i < y.length; i++) {
            lowPassResult[i] = lowPassResult[i-1] + alpha_high * (y[i] - lowPassResult[i-1])
        }
        
        // Em seguida, aplicamos o filtro passa-alta no resultado do passa-baixa
        result.y[0] = lowPassResult[0]
        
        for (let i = 1; i < y.length; i++) {
            result.y[i] = alpha_low * (result.y[i-1] + lowPassResult[i] - lowPassResult[i-1])
        }
        
        return result
    }

    const handleLowFrequencyChange = (_, newValue) => {
        setLowCutoffFrequency(Math.min(newValue, highCutoffFrequency))
    }

    const handleHighFrequencyChange = (_, newValue) => {
        setHighCutoffFrequency(Math.max(newValue, lowCutoffFrequency))
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

        const filteredSignal = calculateBandPass(
            dataset.x, 
            dataset.y, 
            lowCutoffFrequency,
            highCutoffFrequency,
            samplingRate
        )
        setArrayFiltered(filteredSignal)

    }, [lowCutoffFrequency, highCutoffFrequency, posSelectdataset, datasets])

    return(
        <>
            <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                Configurações do Filtro Passa-Faixa
            </Typography>
            <Stack spacing={2}>
                <div>
                    <Typography variant="body2">
                        Frequência de Corte Inferior (Hz): {lowCutoffFrequency}
                    </Typography>
                    <Slider
                        value={lowCutoffFrequency}
                        onChange={handleLowFrequencyChange}
                        valueLabelDisplay="auto"
                        step={1}
                        marks
                        min={1}
                        max={100}
                    />
                </div>
                <div>
                    <Typography variant="body2">
                        Frequência de Corte Superior (Hz): {highCutoffFrequency}
                    </Typography>
                    <Slider
                        value={highCutoffFrequency}
                        onChange={handleHighFrequencyChange}
                        valueLabelDisplay="auto"
                        step={1}
                        marks
                        min={1}
                        max={100}
                    />
                </div>
            </Stack>
        </>
    )
}