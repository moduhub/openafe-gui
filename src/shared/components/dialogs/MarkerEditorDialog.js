import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormControl, InputLabel, Select, MenuItem, Box, TextField, ListItemIcon
} from '@mui/material'
import { MuiColorInput } from 'mui-color-input'
import { Circle, Square, Star, Add, ChangeHistory } from '@mui/icons-material'
import { useState, useEffect } from 'react'

const SYMBOL_OPTIONS = [
  { value: 'circle', icon: <Circle /> },
  { value: 'square', icon: <Square /> },
  { value: 'star', icon: <Star /> },
  { value: 'cross', icon: <Add /> },
  { value: 'triangle-up', icon: <ChangeHistory /> }
]

export const MarkerEditorDialog = ({ open, onClose, initialMarker, onSave }) => {
  const [label, setLabel] = useState('')
  const [symbol, setSymbol] = useState('star')
  const [color, setColor] = useState('#000000')
  const [size, setSize] = useState(12)

  useEffect(() => {
    if (open) {
      setLabel(initialMarker?.label || '')
      setSymbol(initialMarker?.symbol || 'star')
      setColor(initialMarker?.color || '#000000')
      setSize(initialMarker?.size ?? 12)
    }
  }, [open, initialMarker])

  const handleSave = () => {
    onSave({
      label,
      symbol,
      color,
      size: Number(size)
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Editar Marcador</DialogTitle>
      <DialogContent>
        <TextField
          label="Nome da marcação"
          value={label}
          onChange={e => setLabel(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel id="symbol-label">Símbolo</InputLabel>
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
            <MuiColorInput value={color} onChange={setColor} />
          </FormControl>
        </Box>
        <TextField
          label="Tamanho do marcador"
          type="number"
          value={size}
          onChange={e => setSize(Number(e.target.value))}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={!label}>Salvar</Button>
      </DialogActions>
    </Dialog>
  )
}