import { useState } from "react"
import {
    Box,
    Button,
    useTheme,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    ListItemIcon,
    ListItemText,
  } from '@mui/material'

import AspectRatioIcon from '@mui/icons-material/AspectRatio'
import FilterListIcon from '@mui/icons-material/FilterList'

import { useDatasetsContext } from '../../contexts'
import {
    MovingAverage,
    LowPass,
    HighPass,
    BandPass,
    BandStop
} from '..'

export const TabFilter = ({ 
    setPreviewData, 
    previewData, 
    setTabIndex
}) => {
    const theme = useTheme()
    const [selectedFilter, setSelectedFilter] = useState('')
    const {
        datasets,
        datasetSelected, 
        handleNewDataset,
        handleSetDatasetSelected,
        toggleDatasetVisibility,
        showOnlyDataset,
    } = useDatasetsContext()

    const filtersConfig = [
        { label: "MM", tooltip: "Média Móvel", component: <MovingAverage setPreviewFilter={setPreviewData}/> },
        { label: "PB", tooltip: "Passa Baixa", component: <LowPass setPreviewFilter={setPreviewData}/> },
        { label: "PA", tooltip: "Passa Alta", component: <HighPass setPreviewFilter={setPreviewData}/> },
        { label: "PF", tooltip: "Passa Faixa", component: <BandPass setPreviewFilter={setPreviewData}/> },
        { label: "RF", tooltip: "Rejeita Faixa", component: <BandStop setPreviewFilter={setPreviewData}/> },
    ]

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
        }
    }

    const getSelectedFilterComponent = () => {
        const filter = filtersConfig.find(f => f.label === selectedFilter)
        return filter ? filter.component : null
    }

    const handleSaveFilter = () => {
        setTabIndex(0)
    
        const datasetFiltered = datasets[datasetSelected]

        handleNewDataset(
            `${selectedFilter} de ${datasetFiltered.name}`,
            datasetFiltered.params,
            previewData
        )

        setPreviewData({ x: [], y: [] })
    }
    
    const renderSelected = (value) => {
        if (!value) {
            return <>Selecione um filtro</>;
        }
        const { tooltip } = filtersConfig.find((f) => f.label === value) || {};
        return tooltip || '';
    }

    const handleUpdateVisibility = (e) => {
        handleSetDatasetSelected(e.target.value)
        showOnlyDataset(e.target.value)
    }
    
    return (
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
                        <FormControl fullWidth size="small">
                            <InputLabel id="dataset-label">Dataset</InputLabel>
                            <Select
                                labelId="dataset-label"
                                label="Dataset"
                                value={datasetSelected}
                                onChange={handleUpdateVisibility}
                            >
                                {datasets.map((dataset, index) => (
                                <MenuItem key={index} value={index}>
                                    {dataset.name}
                                </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button onClick={handleOpenSettings}>
                            <AspectRatioIcon />
                        </Button>
                    </Box>

                        <Box sx={{ mt: 2, px: 2 }}>                            
                            <Select
                                size="small"
                                fullWidth
                                value={selectedFilter}
                                onChange={(e) => setSelectedFilter(e.target.value)}
                                renderValue={renderSelected}
                                labelId="filtro-label"
                                displayEmpty
                            >
                                <MenuItem value="" disabled>
                                    Selecione um filtro
                                </MenuItem>
                                {filtersConfig.map((filter) => (
                                <MenuItem key={filter.label} value={filter.label}>
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <FilterListIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary={filter.label +" - "+ filter.tooltip} />
                                </MenuItem>
                                ))}
                            </Select>
                        
                            <Box >
                                {getSelectedFilterComponent()}
                            </Box>
                        </Box>
                    
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveFilter}
                        disabled={!selectedFilter}
                        sx={{
                            position: 'absolute',
                            bottom: theme.spacing(2),
                            right: theme.spacing(2),
                        }}
                    >
                        Salvar Filtro
                    </Button>
                </>
            )}
        </Box>
    )
}