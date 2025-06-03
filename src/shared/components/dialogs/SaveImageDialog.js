import { useState } from 'react'
import {
   Dialog, DialogTitle, DialogContent, DialogActions, 
   Button, Select, MenuItem, FormControl, InputLabel, 
   Slide, TextField, Grid, FormGroup, FormControlLabel, Checkbox
} from '@mui/material'

const CHART_LABELS = {
  bodeMod: 'Bode |Z| (dB)',
  bodeAng: 'Bode Phase (°)',
  nyquist: 'Nyquist'
}

export const SaveImageDialog = ({ open, onClose, onSave, availableCharts = [] }) => {
  const [format, setFormat] = useState('png')
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [dpi, setDpi] = useState(96)
  const [selectedCharts, setSelectedCharts] = useState(availableCharts.length ? [availableCharts[0]] : [])
  const [useScreenResolution, setUseScreenResolution] = useState(false)

  const handleChartToggle = (chart) => {
    setSelectedCharts(prev =>
      prev.includes(chart)
        ? prev.filter(c => c !== chart)
        : [...prev, chart]
    )
  }

  const handleSave = () => {
    let exportWidth = width
    let exportHeight = height
    if (useScreenResolution) {
      exportWidth = window.innerWidth
      exportHeight = window.innerHeight
    }
    onSave({
      format,
      width: Number(exportWidth),
      height: Number(exportHeight),
      dpi: Number(dpi),
      charts: availableCharts.length ? selectedCharts : undefined
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
      <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
        Save graph image
      </DialogTitle>
      <DialogContent>
        {availableCharts.length > 0 && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <FormGroup row>
              {availableCharts.map(chart => (
                <FormControlLabel
                  key={chart}
                  control={
                    <Checkbox
                      checked={selectedCharts.includes(chart)}
                      onChange={() => handleChartToggle(chart)}
                    />
                  }
                  label={CHART_LABELS[chart] || chart}
                />
              ))}
            </FormGroup>
          </FormControl>
        )}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="format-label">Format</InputLabel>
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
        <FormControlLabel
          control={
            <Checkbox
              checked={useScreenResolution}
              onChange={e => setUseScreenResolution(e.target.checked)}
            />
          }
          label="Use current screen resolution"
          sx={{ mt: 2 }}
        />
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid>
            <TextField
              label="Width of each graph (px)"
              type="number"
              value={useScreenResolution ? window.innerWidth : width}
              onChange={e => setWidth(Number(e.target.value))}
              fullWidth
              disabled={useScreenResolution}
            />
          </Grid>
          <Grid>
            <TextField
              label="Height of each graph (px)"
              type="number"
              value={useScreenResolution ? window.innerHeight : height}
              onChange={e => setHeight(Number(e.target.value))}
              fullWidth
              disabled={useScreenResolution}
            />
          </Grid>
          <Grid>
            <TextField
              label="DPI"
              type="number"
              value={dpi}
              onChange={e => setDpi(Number(e.target.value))}
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Button variant="outlined" color="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={availableCharts.length > 0 && selectedCharts.length === 0}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}