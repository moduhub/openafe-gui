import { useState } from "react"
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box
} from '@mui/material'

export const InterpolationDialog = ({ 
  open, 
  onClose, 
  selectedPoints, 
}) => {

  const [interpolationType, setInterpolationType] = useState('polinomial')

  const handleInterpolationTypeChange = (event) => {
    setInterpolationType(event.target.value)
  }

  const handleConfirmInterpolation = () => {
    // Here you can handle the interpolation calculation
    console.log('Interpolating with:', {
      type: interpolationType,
    })
    onClose()
  }

  const formatPoint = (point) => {
    if (!point) return "N/A"
    return `(${point.x.toFixed(2)}, ${point.y.toFixed(2)})`
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configuração de Interpolação</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
          <Typography variant="subtitle1">
            Ponto 1: {formatPoint(selectedPoints[0])}
          </Typography>
          <Typography variant="subtitle1">
            Ponto 2: {formatPoint(selectedPoints[1])}
          </Typography>
          
          <FormControl fullWidth>
            <InputLabel>Tipo de Interpolação</InputLabel>
            <Select
              value={interpolationType}
              label="Tipo de Interpolação"
              onChange={handleInterpolationTypeChange}
            >
              <MenuItem value="polinomial">Polinomial</MenuItem>
              <MenuItem value="gaussiana">Gaussiana</MenuItem>
              <MenuItem value="exponencial">Exponencial</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleConfirmInterpolation} color="primary" variant="contained">
          Interpolar
        </Button>
      </DialogActions>
    </Dialog>
  )
}