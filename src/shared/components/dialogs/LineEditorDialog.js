import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormControl, InputLabel, Select, MenuItem, Box, TextField
} from '@mui/material'
import { MuiColorInput } from 'mui-color-input'
import { useState, useEffect } from 'react'

const LINE_STYLES = [
  { value: 'solid', label: 'Solid' },
  { value: 'dot', label: 'Dot' },
  { value: 'dash', label: 'Dash' },
  { value: 'longdash', label: 'Long dash' },
  { value: 'dashdot', label: 'Dash dot' },
  { value: 'longdashdot', label: 'Long dash dot' }
]

export const LineEditorDialog = ({ open, onClose, initialLine, onSave }) => {
  const [color, setColor] = useState('#000000')
  const [style, setStyle] = useState('solid')
  const [width, setWidth] = useState(2)

  useEffect(() => {
    if (open) {
      setColor(initialLine?.color || '#000000')
      setStyle(initialLine?.dash || 'solid')
      setWidth(initialLine?.width ?? 2)
    }
  }, [open, initialLine])

  const handleSave = () => {
    onSave({
      color,
      dash: style,
      width: parseFloat(width)
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Editar Linha</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="line-style-label">Style</InputLabel>
            <Select
              labelId="line-style-label"
              value={style}
              label="Estilo"
              onChange={e => setStyle(e.target.value)}
            >
              {LINE_STYLES.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <MuiColorInput value={color} onChange={setColor} />
          </FormControl>
        </Box>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Espessura"
            type="number"
            inputProps={{ min: 0.5, step: 0.5 }}
            value={width}
            onChange={e => setWidth(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  )
}
