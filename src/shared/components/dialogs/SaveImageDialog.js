import { useState } from 'react'
import {
   Dialog, DialogTitle, DialogContent, DialogActions, 
   Button, Select, MenuItem, FormControl, InputLabel, 
   Slide, TextField, Grid
} from '@mui/material'

export const SaveImageDialog = ({ open, onClose, onSave }) => {

  const [format, setFormat] = useState('png')
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [dpi, setDpi] = useState(96)

  const handleSave = () => {
    onSave({
    format,
    width: Number(width),
    height: Number(height),
    dpi: Number(dpi)
  })
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      fullWidth
      maxWidth="sm"
      slots={{
        transition: Slide, 
      }}
    >
      <DialogTitle
        sx={{ textAlign: 'center', pt: 3 }}
      >
        Save graph image
      </DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="format-label">Formato</InputLabel>
          <Select
            labelId="format-label"
            value={format}
            label="Formato"
            onChange={e => setFormat(e.target.value)}
          >
            <MenuItem value="png">PNG</MenuItem>
            <MenuItem value="jpeg">JPEG</MenuItem>
          </Select>
        </FormControl>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid>
            <TextField
              label="Largura (px)"
              type="number"
              value={width}
              onChange={e => setWidth(Number(e.target.value))}
              fullWidth
            />
          </Grid>
          <Grid>
            <TextField
              label="Altura (px)"
              type="number"
              value={height}
              onChange={e => setHeight(Number(e.target.value))}
              fullWidth
            />
          </Grid>
          <Grid>
            <TextField
              label="DPI"
              type="number"
              value={dpi}
              onChange={e => setDpi(Number(e.target.value))}
              fullWidth            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Button variant="outlined" color="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
