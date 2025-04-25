import { useState } from "react"

import {
    Box,
    Button,
    useTheme,
    Typography,
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogTitle,
    Select,
    MenuItem,
    List,
    ListItem,
    Tabs,
    Tab,
} from '@mui/material'

import Slider from '@mui/material/Slider'

import CalculateIcon from '@mui/icons-material/Calculate'
import AspectRatioIcon from '@mui/icons-material/AspectRatio'

import { useDatasetsContext } from '../../contexts'

export const TabFilter = () => {
    const theme = useTheme()
    const {
        datasets,
        datasetSelected, handleSetDatasetSelected,
        handleDeleteDataset,
        handleNewDataset
    } = useDatasetsContext()

    const [open, setOpen] = useState(false)
    const [indexToDelete, setIndexToDelete] = useState(null)

    const [windowSize, setWindowSize] = useState(3)

    const [activeFilterTab, setActiveFilterTab] = useState(0)
    const [cutoffFrequency, setCutoffFrequency] = useState(50)
    const [lowCutoffFrequency, setLowCutoffFrequency] = useState(10)
    const [highCutoffFrequency, setHighCutoffFrequency] = useState(50)


    const handleClickOpen = (index) => {
        setIndexToDelete(index)
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        setIndexToDelete(null)
    }

    const handleDelete = () => {
        if (indexToDelete !== null) handleDeleteDataset(indexToDelete)
        handleClose()
    }

    const valuetext = (value) => `${value}`

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

    const handleCalculate = () => {
        if (!datasetSelected) {
            console.error("Nenhum dataset selecionado.")
            return
        }

        const selectedDataset = datasets.find(dataset => dataset.name === datasetSelected)
        if (!selectedDataset || !selectedDataset.data || selectedDataset.data.length === 0) {
            console.error("Dataset inválido ou vazio.")
            return
        }

        const x = selectedDataset.data[0].x
        const y = selectedDataset.data[0].y

        if (!x || !y || x.length !== y.length) {
            console.error("Dados do dataset estão incompletos ou inconsistentes.")
            return
        }

        const movingAveragePoints = calculateMovingAverage(x, y, windowSize) // <-- usando windowSize
        handleNewDataset(`M.M. (${windowSize}) de ${datasetSelected}`,selectedDataset.params,movingAveragePoints)
    }   

    const handleOpenSettings = () => {
        if (window.electron) {
            const settingsData = {
                datasets: datasets.map(dataset => ({
                    name: dataset.name,
                    data: dataset.data.map(point => ({
                        x: Array.from(point.x),
                        y: Array.from(point.y)
                    })),
                    params: {
                        ...dataset.params,
                    }
                })),
                ...(datasetSelected && { selectedDataset: datasetSelected })
            }
            window.electron.openSettingsWindow(settingsData)
        } else {
            console.error("API do Electron não está disponível.")
        }
    }

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

    const handleCalculateFilter = () => {
        if (!datasetSelected) return

        const selectedDataset = datasets.find(dataset => dataset.name === datasetSelected)
        if (!selectedDataset?.data?.[0]) return

        const x = selectedDataset.data[0].x
        const y = selectedDataset.data[0].y
        const fs = selectedDataset.params.scanRate / selectedDataset.params.step

        let result
        let filterName = ''

        switch(activeFilterTab) {
            case 0: // Média Móvel
                result = calculateMovingAverage(x, y, windowSize)
                filterName = `M.M. (${windowSize})`
                break
            case 1: // Passa Baixa
                result = calculateLowPass(x, y, cutoffFrequency, fs)
                filterName = `PB (${cutoffFrequency}Hz)`
                break
            case 2: // Passa Alta
                result = calculateHighPass(x, y, cutoffFrequency, fs)
                filterName = `PA (${cutoffFrequency}Hz)`
                break
            case 3: // Passa Faixa
                result = calculateBandPass(x, y, lowCutoffFrequency, highCutoffFrequency, fs)
                filterName = `PF (${lowCutoffFrequency}-${highCutoffFrequency}Hz)`
                break
            case 4: // Rejeita Faixa
                result = calculateBandPass(x, y, lowCutoffFrequency, highCutoffFrequency, fs)
                filterName = `RF (${lowCutoffFrequency}-${highCutoffFrequency}Hz)`
                break
        }

        handleNewDataset(`${filterName} de ${datasetSelected}`, selectedDataset.params, result)
    }

    const filterControls = [
        // Média Móvel
        <Box key="mm">
            <Slider
                aria-label="Tamanho da Janela"
                value={windowSize}
                onChange={(e, newValue) => setWindowSize(newValue)}
                getAriaValueText={valuetext}
                valueLabelDisplay="auto"
                step={1}
                marks
                min={3}
                max={10}
                sx={{ width: "95%" }}
            />
        </Box>,
        // Passa Baixa
        <Box key="pb">
            <Typography variant="body2">
                Frequência de Corte (Hz): {cutoffFrequency}
            </Typography>
            <Slider
                value={cutoffFrequency}
                onChange={(e, newValue) => setCutoffFrequency(newValue)}
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={100}
                sx={{ width: "95%" }}
            />
        </Box>,
        // Passa Alta
        <Box key="pa">
            <Typography variant="body2">
                Frequência de Corte (Hz): {cutoffFrequency}
            </Typography>
            <Slider
                value={cutoffFrequency}
                onChange={(e, newValue) => setCutoffFrequency(newValue)}
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={100}
                sx={{ width: "95%" }}
            />
        </Box>,
        // Passa Faixa
        <Box key="pf">
            <Typography variant="body2">
                Frequência de Corte Inferior (Hz): {lowCutoffFrequency}
            </Typography>
            <Slider
                value={lowCutoffFrequency}
                onChange={(e, newValue) => setLowCutoffFrequency(Math.min(newValue, highCutoffFrequency))}
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={100}
                sx={{ width: "95%" }}
            />
            <Typography variant="body2">
                Frequência de Corte Superior (Hz): {highCutoffFrequency}
            </Typography>
            <Slider
                value={highCutoffFrequency}
                onChange={(e, newValue) => setHighCutoffFrequency(Math.max(newValue, lowCutoffFrequency))}
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={100}
                sx={{ width: "95%" }}
            />
        </Box>,
        // Rejeita Faixa
        <Box key="rf">
            <Typography variant="body2">
                Frequência de Corte Inferior (Hz): {lowCutoffFrequency}
            </Typography>
            <Slider
                value={lowCutoffFrequency}
                onChange={(e, newValue) => setLowCutoffFrequency(Math.min(newValue, highCutoffFrequency))}
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={100}
                sx={{ width: "95%" }}
            />
            <Typography variant="body2">
                Frequência de Corte Superior (Hz): {highCutoffFrequency}
            </Typography>
            <Slider
                value={highCutoffFrequency}
                onChange={(e, newValue) => setHighCutoffFrequency(Math.max(newValue, lowCutoffFrequency))}
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={100}
                sx={{ width: "95%" }}
            />
        </Box>
    ]


    return (
        <>
            {/* Dialog de confirmação de exclusão */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Confirmar exclusão</DialogTitle>
                <DialogContent>
                    <p>Você tem certeza de que deseja excluir este item?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        Cancelar
                    </Button>
                    <Button onClick={handleDelete} color="primary">
                        Excluir
                    </Button>
                </DialogActions>
            </Dialog>

            <Box
                sx={{
                    height: 440,
                    width: 248,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {datasets.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="textSecondary"
                        align="center"
                        sx={{ padding: theme.spacing(2), marginTop: theme.spacing(2) }}
                    >
                        Não há datasets em cache no momento.
                    </Typography>
                ) : (
                    <>
                        <Box 
                            display="flex" 
                            justifyContent="space-around" 
                            alignItems="center"
                            marginTop={theme.spacing(2)}
                            gap={theme.spacing(1)}
                        >
                            <Select
                                value={datasets.some(dataset => dataset.name === datasetSelected) ? datasetSelected : ''}
                                onChange={(e) => handleSetDatasetSelected(e.target.value)}
                                size="small"
                                sx={{ width: "70%" }}
                            >
                                {datasets.map((dataset, index) => (
                                    <MenuItem
                                        key={index}
                                        value={dataset.name}
                                    >
                                        {dataset.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            <Button onClick={handleOpenSettings}>
                                <AspectRatioIcon />
                            </Button>
                        </Box>
                        
                        <List sx={{ marginTop: "8px" }}>

                            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
                                <Tabs 
                                    value={activeFilterTab} 
                                    onChange={(e, newValue) => setActiveFilterTab(newValue)}
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    sx={{ minHeight: '36px' }}
                                >
                                    <Tab label="MM" sx={{ minHeight: '36px' }} />
                                    <Tab label="PB" sx={{ minHeight: '36px' }} />
                                    <Tab label="PA" sx={{ minHeight: '36px' }} />
                                    <Tab label="PF" sx={{ minHeight: '36px' }} />
                                    <Tab label="RF" sx={{ minHeight: '36px' }} />
                                </Tabs>
                            </Box>

                            <Box sx={{ p: 2 }}>
                                {filterControls[activeFilterTab]}
                                
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleCalculateFilter}
                                    startIcon={<CalculateIcon />}
                                    sx={{ mt: 2 }}
                                >
                                    Calcular
                                </Button>
                            </Box>
                        </List>
                    </>
                )}
            </Box>
        </>
    )
}