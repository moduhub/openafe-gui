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
    MenuItem
} from '@mui/material'

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
                <Select
                    value={datasetSelected}
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
            )}
        </Box>
        </>
    )
}