import React, { useState } from 'react'
import { 
    Box, 
    Slider, 
    Typography, 
    Button, 
    Tabs, 
    Tab, 
    Tooltip,
    Paper
} from '@mui/material'
import { ChartComponent } from '../../shared/components'

export const Filters = () => {
    const [windowSize, setWindowSize] = useState(3)
    const [activeTab, setActiveTab] = useState(0)

    const handleSave = () => {
        if (window.electron) {
            window.electron.sendCommand('save-settings', { windowSize })
        }
        window.close()
    }

    const type_chart_filters = {
        height: '100%',
        width: '100%'
    }

    return (
        <Box sx={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Tabs Header */}
            <Paper elevation={2} sx={{ minHeight: '48px' }}>
                <Tabs 
                    value={activeTab} 
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    sx={{ 
                        minHeight: '48px',
                        '& .MuiTab-root': { minHeight: '48px' }
                    }}
                >
                    <Tooltip title="Média Móvel">
                        <Tab label="MM" />
                    </Tooltip>
                    <Tooltip title="Passa Baixa">
                        <Tab label="PB" />
                    </Tooltip>
                </Tabs>
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
                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                        Configurações da Média Móvel
                    </Typography>
                    <Typography variant="body2">
                        Tamanho da Janela
                    </Typography>
                    <Slider
                        value={windowSize}
                        onChange={(e, newValue) => setWindowSize(newValue)}
                        valueLabelDisplay="auto"
                        step={1}
                        marks
                        min={3}
                        max={10}
                        sx={{ width: "100%" }}
                    />
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleSave}
                        size="small"
                        sx={{ alignSelf: 'flex-start', mt: 'auto' }}
                    >
                        Salvar
                    </Button>
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
                        <ChartComponent type_={type_chart_filters}/>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}