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
                            {/* Moving Average */}
                            <ListItem>
                                <Box width="50%">
                                    <Typography>Media Móvel</Typography>
                                </Box>

                                <Box
                                    width="50%"
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        overflow: 'hidden',
                                        alignItems: 'center',
                                        bgcolor: 'background.paper',
                                        justifyContent: 'end'
                                    }}
                                >
                                    <Button
                                        sx={{
                                            minWidth: 'auto',
                                            justifyContent: 'space-between'
                                        }}
                                        width="100%"
                                        onClick={ handleCalculate} 
                                    >
                                        <CalculateIcon />
                                    </Button>   
                                </Box>
                            </ListItem>

                            {/* Slider */}
                            <ListItem>
                                <Box
                                    display="flex"
                                    width="100%"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Slider
                                        aria-label="Tamanho da Janela"
                                        value={windowSize} // <-- Valor controlado
                                        onChange={(e, newValue) => setWindowSize(newValue)} // <-- Atualiza o valor
                                        getAriaValueText={valuetext}
                                        valueLabelDisplay="auto"
                                        step={1}
                                        marks
                                        min={3}
                                        max={10}
                                        sx={{ width: "95%" }}
                                    />
                                </Box>
                            </ListItem>
                        </List>
                    </>
                )}
            </Box>
        </>
    )
}