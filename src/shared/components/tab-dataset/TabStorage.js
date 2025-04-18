import { useState } from 'react'

import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  useTheme,
  Typography,
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle
} from '@mui/material'

import { FixedSizeList } from 'react-window'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import SaveAltIcon from '@mui/icons-material/SaveAlt'
import DeleteIcon from '@mui/icons-material/Delete'
import StartIcon from '@mui/icons-material/Start'

import { 
    useDatasetsContext,
} from '../../contexts'

export const TabStorage = ()=>{

    const theme = useTheme()
    const { 
        datasetSelected, 
        handleDeleteDataset,
        datasets
    } = useDatasetsContext()
  
    const [open, setOpen] = useState(false)
    const [indexToDelete, setIndexToDelete] = useState(null)
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

    return(
        <>
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
                sx={{
                    padding: theme.spacing(2),
                    marginTop: theme.spacing(2),
                }}
                >
                    Não há datasets em cache no momento.
                </Typography>
            ) : (
                datasets.map((dataset, index) => (
                <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {dataset.name || `Dataset ${index + 1}`}
                    </AccordionSummary>
                    <AccordionDetails>
                    <Box
                        width="100%"
                        display="flex"
                        marginBottom={1}
                        justifyContent="center"
                        overflow="hidden"
                    >
                    {[
                        { onClick: () => datasets[index].setIsVisible(), icon: datasets[index].visible ? <VisibilityOffIcon /> : <VisibilityIcon /> },
                        { icon: <SaveAltIcon /> },
                        { onClick: () => handleClickOpen(index), icon: <DeleteIcon /> },
                        { icon: <StartIcon /> }
                    ].map((btn, i) => (
                        <Button
                            key={i}
                            onClick={btn.onClick}
                            sx={{ 
                                minWidth: 'auto', 
                                justifyContent: 'space-between',
                            }}
                            width="100%"
                        >
                        {btn.icon}
                        </Button>
                    ))}
                    </Box>

                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        Parameters
                        </AccordionSummary>
                        <AccordionDetails>
                        settlingTime: {dataset.params.settlingTime}<br/>
                        startPotential: {dataset.params.startPotential}<br/>
                        endPotential: {dataset.params.endPotential}<br/>
                        step: {dataset.params.step}<br/>
                        scanRate: {dataset.params.scanRate}<br/>
                        cycles: {dataset.params.cycles}<br/>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        Points
                        </AccordionSummary>
                        <AccordionDetails>
                        <Box sx={{ height: 150, width: "100%" }}>  
                            <FixedSizeList
                            height={150}
                            width="100%"
                            itemSize={35}
                            itemCount={dataset.data[0].x.length}
                            overscanCount={5}
                            >
                            {({ index, style }) => (
                                <Box style={style}>
                                {index}: [{dataset.data[0].x[index]}; {dataset.data[0].y[index]}]
                                </Box>
                            )}
                            </FixedSizeList>
                        </Box>
                        </AccordionDetails>
                    </Accordion>
                    </AccordionDetails>
                </Accordion>
                ))
            )}
        </Box>
        </>
    )
}