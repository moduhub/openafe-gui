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
  Box,
  Slider
} from '@mui/material'

import { useDatasetsContext } from '../../contexts'

import { calculatePolynomialInterpolation } from "../../math-functions/"

export const InterpolationDialog = ({
  open,
  onClose,
  selectedPoints,
  setInterpolationParams,
}) => {
  const { datasets, datasetSelected } = useDatasetsContext()

  const [interpolationType, setInterpolationType] = useState('')
  const [points, setPoints] = useState([])
  const [sizeInterpolation, setSizeInterpolation] = useState(0)
  const [maxOrdem, setMaxOrdem] = useState(0)
  const [polynomialOrder, setPolynomialOrder] = useState(1)
  
  const handleInterpolationTypeChange = (event) => {
    setInterpolationType(event.target.value)
 
    if (event.target.value === "polinomial") 
      updateInterpolationData()
    
  }

  const handleSliderChange = (_, newValue) => {
    setPolynomialOrder(newValue)
  }

  const handleConfirmInterpolation = () => {
    if (interpolationType === 'polinomial' && selectedPoints.length === 2) {
      const result = calculatePolynomialInterpolation(points, datasets, datasetSelected, polynomialOrder);
  
      setInterpolationParams({
        order: polynomialOrder,
        coefficients: result.coefficients,
        interpolatedX: result.interpolatedX,
        interpolatedY: result.interpolatedY,
      });
    }
  
    handleCloseDialog();
  }

  const formatPoint = (point) => {
    if (!point) return "N/A"
    return `(${point.x.toFixed(2)}, ${point.y.toFixed(2)})`
  }

  const updateInterpolationData = () => {
    if (!selectedPoints || selectedPoints.length < 2) return;
  
    const xValues = datasets?.[datasetSelected]?.data[0]?.x || [];
    const [p1, p2] = selectedPoints;
  
    const idx1 = xValues.findIndex(x => x === p1?.x);
    const idx2 = xValues.findIndex(x => x === p2?.x);
  
    if (idx1 === -1 || idx2 === -1) return;
  
    const orderedPoints = idx1 < idx2 ? [idx1, idx2] : [idx2, idx1];
    setPoints(orderedPoints);
  
    const newSize = xValues.slice(orderedPoints[0], orderedPoints[1] + 1).length;
    setSizeInterpolation(newSize);
    setMaxOrdem(Math.min(newSize - 1, 5)); // Ajustar o limite da ordem
  }

  const handleCloseDialog = () => {
    setInterpolationType('')
    setPoints([])
    setSizeInterpolation(0)
    setMaxOrdem(0)
    setPolynomialOrder(1)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
      <DialogTitle>
        Interpolação em {datasets?.[datasetSelected]?.name || 'conjunto desconhecido'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
          <Typography variant="subtitle1">
            Ponto 1: {formatPoint(selectedPoints?.[0])}
          </Typography>
          <Typography variant="subtitle1">
            Ponto 2: {formatPoint(selectedPoints?.[1])}
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
        {interpolationType === "polinomial" && (
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>
              Ordem do Polinômio: {polynomialOrder}
            </Typography>
            <Slider
              value={polynomialOrder}
              onChange={handleSliderChange}
              min={1}
              max={maxOrdem > 1 ? maxOrdem - 1 : 1}
              step={1}
              marks
              valueLabelDisplay="auto"
              disabled={maxOrdem <= 2} 
            />
            {maxOrdem <= 2 && (
              <Typography variant="caption" color="textSecondary">
                O ajuste da ordem do polinômio não é possível para este conjunto de pontos.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="secondary">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmInterpolation}
          color="primary"
          variant="contained"
          disabled={!interpolationType}
        >
          Interpolar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
