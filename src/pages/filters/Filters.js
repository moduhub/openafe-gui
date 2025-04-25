import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Tooltip,
  Paper,
  Select,
  MenuItem
} from '@mui/material';

import { 
    ChartComponent,
    MovingAverage,
    LowPass, 
    HighPass,
    BandPass,
    BandStop
} from '../../shared/components'

import {
    useDatasetsContext
} from '../../shared/contexts'

export const Filters = () => {
    const [windowSize, setWindowSize] = useState(3)
    const [activeTab, setActiveTab] = useState(0)
    const [arrayFiltered, setArrayFiltered] = useState({ x: [], y: [] })
    const [selectedDataset, setSelectedDataset] = useState("")
    const [posSelecteDataset, setPosSelectedDataset] = useState(0)
    
    const {
        datasets, handleSetDataset
    } = useDatasetsContext()
    

    const handleSave = () => {
        if (window.electron) {
            window.electron.sendCommand('save-settings', { 
                windowSize,
            })
        }
        window.close()
    }

    const type_chart_filters = {
        height: '100%',
        width: '100%'
    }

    const handleWindowSizeChange = (newValue) => {
        setWindowSize(newValue) 
    }

    const recreateDatasetStates = (parsedDatasets) => {
        const datasetsWithStates = parsedDatasets.map(dataset => {
            const visible_ = selectedDataset ? (selectedDataset == dataset.name) : false;
            
            const handleSetIsVisible = () => {
                handleSetDataset(prevDatasets =>
                    prevDatasets.map(d =>
                        d.name === dataset.name
                            ? { ...d, visible: !d.visible }
                            : d
                    )
                )
            }

            return {
                ...dataset,
                visible: visible_,
                setIsVisible: handleSetIsVisible,
            }
        })

        return datasetsWithStates
    }

    useEffect(() => {
        if (window.electron) {
            window.electron.onSettingsData((settingsData) => {
                try {
                    const datasetsWithStates = recreateDatasetStates(settingsData.datasets)
                    handleSetDataset(datasetsWithStates)
                    if (settingsData.selectedDataset) {
                        setSelectedDataset(settingsData.selectedDataset)
                    }
                } catch (error) {
                    console.error('Error processing settings data:', error)
                }
            })
        }
    }, [])  

    useEffect(() => {
        if (selectedDataset && datasets.length > 0) {
            const datasetIndex = datasets.findIndex(dataset => dataset.name === selectedDataset)
            
            if (datasetIndex !== -1) {
                setPosSelectedDataset(datasetIndex)
                
                const needsVisibilityUpdate = datasets.some(dataset => 
                    (dataset.name === selectedDataset && !dataset.visible) ||
                    (dataset.name !== selectedDataset && dataset.visible)
                );
    
                if (needsVisibilityUpdate) {
                    const updatedDatasets = datasets.map(dataset => ({
                        ...dataset,
                        visible: dataset.name === selectedDataset
                    }));
                    handleSetDataset(updatedDatasets)
                }
            }
        }
    }, [selectedDataset, datasets.length])
    

    const filtersConfig = [
        {
            label: "MM",
            tooltip: "Média Móvel",
            component: (
                <MovingAverage 
                    windowSize={windowSize} 
                    onWindowSizeChange={handleWindowSizeChange}
                    setArrayFiltered={setArrayFiltered}
                />
            ),
        },
        {
            label: "PB",
            tooltip: "Passa Baixa",
            component: (
                <LowPass 
                    posSelectdataset={posSelecteDataset}
                    setArrayFiltered={setArrayFiltered}
                />
            ),
        },
        {
            label: "PA",
            tooltip: "Passa Alta",
            component: (
                <HighPass 
                    posSelectdataset={posSelecteDataset}
                    setArrayFiltered={setArrayFiltered}
                />
            ),
        },
        {
            label: "PF",
            tooltip: "Passa Faixa",
            component: (
                <BandPass 
                    posSelectdataset={posSelecteDataset}
                    setArrayFiltered={setArrayFiltered}
                />
            ),
        },
        {
            label: "RF",
            tooltip: "Rejeita Faixa",
            component: (
                <BandStop 
                    posSelectdataset={posSelecteDataset}
                    setArrayFiltered={setArrayFiltered}
                />
            ),
        }
    ]

    return (
        <Box sx={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Tabs Header */}
            <Paper
                elevation={2}
                sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: '48px',
                px: 1
                }}
            >
                <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{
                    minHeight: '48px',
                    '& .MuiTab-root': { minHeight: '48px' }
                }}
                >
                {filtersConfig.map((filter, index) => (
                    <Tooltip key={filter.label} title={filter.tooltip}>
                    <Tab label={filter.label} />
                    </Tooltip>
                ))}
                </Tabs>

                {/* Select para escolher o dataset */}
                <Select
                value={
                    datasets.some((dataset) => dataset.name === selectedDataset)
                    ? selectedDataset
                    : ''
                }
                onChange={(e) => setSelectedDataset(e.target.value)}
                size="small"
                sx={{ width: '30%' }}
                >
                {datasets.map((dataset, index) => (
                    <MenuItem key={index} value={dataset.name}>
                    {dataset.name}
                    </MenuItem>
                ))}
                </Select>
            </Paper>

            {/* Main Content */}
            <Box sx={{ 
                display: 'flex', 
                flex: 1,
                padding: 1.5,
                gap: 2
            }}>
                {/* Left Side - Controls */}
                <Box sx={{ 
                    width: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5
                }}>
                    {filtersConfig[activeTab].component}
                </Box>

                {/* Right Side - Preview Chart */}
                <Box sx={{ 
                    width: '400px',
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    padding: 1,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            textAlign: 'center',
                            color: 'text.secondary',
                            mb: 0.5
                        }}
                    >
                        Visualização do Preview
                    </Typography>
                    <Box sx={{ 
                        flex: 1,
                        position: 'relative',  
                        height: '300px'
                    }}>
                        <ChartComponent 
                            type_={type_chart_filters}
                            previewData={arrayFiltered}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}