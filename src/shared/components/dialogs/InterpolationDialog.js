import { useState, useEffect } from "react"
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
  Slider,
} from "@mui/material"

import { useDatasetsContext } from "../../contexts"

import { calculatePolynomialInterpolation } from "../../math-functions/"

export const InterpolationDialog = ({
  open,
  onClose,
  selectedPoints,
}) => {
  const { datasets, datasetSelected } = useDatasetsContext()

  const params = datasets?.[datasetSelected]?.params || {}
  const start  = params.startPotential ?? 0
  const end    = params.endPotential   ?? 0
  const step   = params.step           ?? 1
  const delta = end - start
  const minStart = start - 0.5 * delta
  const maxEnd = end + 0.5 * delta

  const [interpolationType, setInterpolationType] = useState("")
  const [points, setPoints] = useState([])
  const [range, setRange] = useState({ min: start, max: end })
  const [polynomialOrder, setPolynomialOrder] = useState(1)

  const handleInterpolationTypeChange = (event) => {
    const type = event.target.value;
    setInterpolationType(type)
    updateData()
  }

  const updateData = () => {
    if (!selectedPoints || selectedPoints.length < 2) return
    const xValues = datasets?.[datasetSelected]?.data[0]?.x || []
    const yValues = datasets?.[datasetSelected]?.data[0]?.y || []
    const [p1, p2] = selectedPoints
    const idx1 = xValues.findIndex((x, i) => x === p1?.x && yValues[i] === p1?.y)
    const idx2 = xValues.findIndex((x, i) => x === p2?.x && yValues[i] === p2?.y)
    if (idx1 === -1 || idx2 === -1) return

    setPoints([idx1, idx2])
    setRange({
      min: xValues[idx1],
      max: xValues[idx2],
    })
  }

  const handleRangeChange = (key) => (_, newValue) => {
    setRange((prev) => ({ ...prev, [key]: newValue }))
  }

  const handleOrderChange = (_, newValue) => {
    setPolynomialOrder(newValue)
  }

  const handleConfirmInterpolation = () => {
    if (interpolationType === "polinomial" && selectedPoints.length === 2) {
      const result = calculatePolynomialInterpolation(
        points,
        datasets,
        datasetSelected,
        polynomialOrder,
        range
      )

      const newInterpolation = {
        type: 'polynomial',
        order: polynomialOrder,
        coefficients: result.coefficients,
        isVisible: true,
        data: [{
          x: result.interpolatedX,
          y: result.interpolatedY,
          mode: 'lines',
          line: { 
            //color: '#000000', // You can customize the color
            dash: 'dot'  // Makes the line dashed to distinguish from original data
          },
          name: `Interpolação ${polynomialOrder}° grau`
        }]
      }
  
      datasets[datasetSelected]?.addInterpolation(newInterpolation)
    }

    handleCloseDialog()
  }

  const handleCloseDialog = () => {
    setInterpolationType("")
    setPoints([])
    setRange({ min: points[0].x, max: points[1].x })
    setPolynomialOrder(1)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
      <DialogTitle>
        Interpolação em {datasets?.[datasetSelected]?.name || "conjunto desconhecido"}
      </DialogTitle>
      <DialogContent>
        
        <Box sx={{ mb: 2 }}>
          <Typography>
            Ponto 1: {selectedPoints?.[0] ? `(${selectedPoints[0].x}, ${selectedPoints[0].y})` : "Não selecionado"}
          </Typography>
          <Typography>
            Ponto 2: {selectedPoints?.[1] ? `(${selectedPoints[1].x}, ${selectedPoints[1].y})` : "Não selecionado"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, my: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Tipo de Interpolação</InputLabel>
            <Select
              value={interpolationType}
              label="Tipo de Interpolação"
              onChange={handleInterpolationTypeChange}
            >
              <MenuItem value="polinomial">Polinomial</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {interpolationType === "polinomial" && (
          <Box sx={{ mt: 2 }}>
          <Typography gutterBottom>Ordem do Polinômio:</Typography>
          <Slider
            value={polynomialOrder}
            onChange={handleOrderChange}
            min={1}
            max={5}
            step={1}
            valueLabelDisplay="auto"
            sx={{ mb: 2 }}
          />
          <Typography gutterBottom>Intervalo de X:</Typography>
          <Slider
            value={range.min}
            onChange={handleRangeChange("min")}
            min={minStart}
            max={maxEnd}
            step={step}
            valueLabelDisplay="auto"
            sx={{ mb: 2 }}
          />
          <Slider
            value={range.max}
            onChange={handleRangeChange("max")}
            min={minStart}
            max={maxEnd}
            step={step}
            valueLabelDisplay="auto"
          />
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