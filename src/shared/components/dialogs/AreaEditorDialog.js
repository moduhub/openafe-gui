import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormControl, Box, TextField,
  Divider
} from '@mui/material'
import { MuiColorInput } from 'mui-color-input'
import { useState, useEffect } from 'react'

/**
 *  @brief Dialog to edit properties of a selected area.
 *
 * Props:
 * @param {boolean} open - Boolean to control dialog visibility
 * @param {() => void} onClose - Callback to close the export dialog
 * @param {{color?: string, label?: string}} initialArea - Initial values of the area (color and label).
 * @param {(area: {color: string, label: string}) => void} onSave - Callback called when saving changes.
 *
 * Behavior:
 * - Upon opening, initializes fields with initialArea.
 * - When saving, it calls onSave with the current values and closes the dialog.
 */
export const AreaEditorDialog = ({ open, onClose, initialArea, onSave }) => {
  const [color, setColor] = useState('#1976d2')
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (open) {
      setColor(initialArea?.color || '#1976d2')
      setLabel(initialArea?.label || '')
    }
  }, [open, initialArea])

  const handleSave = () => {
    onSave({ color, label })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Area</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <TextField
              label="Nome"
              value={label}
              onChange={e => setLabel(e.target.value)}
              fullWidth
            />
          </FormControl>
          <FormControl fullWidth>
            <MuiColorInput value={color} onChange={setColor} />
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  )
}