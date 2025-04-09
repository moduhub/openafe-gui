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

import Slider from '@mui/material/Slider';

import CalculateIcon from '@mui/icons-material/Calculate';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'

import { useDatasetsContext } from '../../contexts'

export const TabFilter = ()=>{

    const theme = useTheme();
    const {  
        datasets,
        datasetSelected, handleSetDatasetSelected,
        handleDeleteDataset
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

    const valuetext = (value) => {return `${value}°C`}


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
                    sx={{ padding: theme.spacing(2), marginTop: theme.spacing(2)}}
                >
                    Não há datasets em cache no momento.
                </Typography>
            ) : (
                <>
                <Select
                value={datasets.some(dataset => dataset.name === datasetSelected) ? datasetSelected : ''}
                    onChange={(e)=>handleSetDatasetSelected(e.target.value)}
                    size="small"
                    sx={{ marginTop: theme.spacing(2)}}
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
                <List sx={{marginTop:"8px   "}}>
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
                        {[
                            {icon: <CalculateIcon/>},
                            {icon: <VisibilityIcon/>}
                        ].map((btn , i) => (
                            <Button
                                key={i}
                                sx={{
                                    minWidth: 'auto',
                                    justifyContent: 'space-between'
                                }}
                                width="100%"
                            >
                                {btn.icon}
                            </Button>
                        ))}
                        </Box>

                    </ListItem>
                    <ListItem>
                        <Box 
                            display="flex"
                            width="100%"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Slider
                                aria-label="Order"
                                defaultValue={1}
                                getAriaValueText={valuetext}
                                valueLabelDisplay="auto"
                                shiftStep={1}
                                step={1}
                                marks min={1}
                                max={10}
                                sx={{width:"95%"}}
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