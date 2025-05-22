import { Box,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  MenuItem, 
  Select, 
  InputLabel, 
  FormControl,
  ListItemIcon,
  Typography,
} from '@mui/material'
import { Circle, Square, Star, Close, ChangeHistory } from '@mui/icons-material'
import { useState } from 'react'
import { MuiColorInput } from 'mui-color-input'

import { useDatasetsContext } from '../../contexts'

const SYMBOL_OPTIONS = [
  { value: 'circle', icon: <Circle /> },
  { value: 'square', icon: <Square /> },
  { value: 'star', icon: <Star /> },
  { value: 'cross', icon: <Close /> },
  { value: 'triangle-up', icon: <ChangeHistory /> }
]

export const AddMarkDialog = ({ open, onClose, point }) => {

  const { datasets, datasetSelected } = useDatasetsContext()

  const [label, setLabel] = useState('')
  const [symbol, setSymbol] = useState('star')
  const [color, setColor] = useState('#000000')

  const handleSave = () => {
    const newMarker = { 
      ...point, 
      label, 
      symbol, 
      color, 
      isVisible: true,
    }

    datasets[datasetSelected]?.addPointMarker(newMarker)

    setLabel('')
    setSymbol('cross')
    setColor('#000000')
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Markup</DialogTitle>
      <DialogContent>

        <Typography mb={3}>
          Point: ({point?.x}, {point?.y})
        </Typography>

        <TextField
          label="Nome da marcação"
          value={label}
          onChange={e => setLabel(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel id="symbol-label">Symbol</InputLabel>
            <Select
              labelId="symbol-label"
              value={symbol}
              label="Símbolo"
              onChange={e => setSymbol(e.target.value)}
            >
              {SYMBOL_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value} sx={{ display: 'flex', alignItems: 'center' }}>
                <ListItemIcon sx={{ color: color, minWidth: 32 }}>
                  {opt.icon}
                </ListItemIcon>
              </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ flex: 2 }}>
            <MuiColorInput value={color} onChange={setColor}/>
          </FormControl>
        </Box>
        
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} disabled={!label}>Salvar</Button>
      </DialogActions>
    </Dialog>
  )
}
