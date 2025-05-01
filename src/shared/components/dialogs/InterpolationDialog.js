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
  setInterpolationParams,
}) => {
  const { datasets, datasetSelected, handleAddInterpolation } = useDatasetsContext()

  const params = datasets?.[datasetSelected]?.params || {}
  const start  = params.startPotential ?? 0
  const end    = params.endPotential   ?? 0
  const step   = params.step           ?? 0
  const delta = end - start
  const minStart = start - 0.5 * delta
  const maxEnd = end + 0.5 * delta

  const [interpolationType, setInterpolationType] = useState("")
  const [points, setPoints] = useState([])
  const [range, setRange] = useState({ min: start, max: end })
  const [polynomialOrder, setPolynomialOrder] = useState(1)

  const handleInterpolationTypeChange = (event) => {
    setInterpolationType(event.target.value)

    if (event.target.value === "polinomial") updateInterpolationData()
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

      setInterpolationParams({
        order: polynomialOrder,
        coefficients: result.coefficients,
        interpolatedX: result.interpolatedX,
        interpolatedY: result.interpolatedY,
      })

      const newInterpolation = {
        type: 'polynomial',
        order: polynomialOrder,
        coefficients: result.coefficients,
        data: [{
          x: result.interpolatedX,
          y: result.interpolatedY,
          mode: 'lines',
          line: { 
            color: '#000000', // You can customize the color
            dash: 'dot'  // Makes the line dashed to distinguish from original data
          },
          name: `Interpolação ${polynomialOrder}° grau`
        }]
      }
  
      datasets[datasetSelected]?.addInterpolation(newInterpolation)
    }

    handleCloseDialog()
  }

  const updateInterpolationData = () => {
    if (!selectedPoints || selectedPoints.length < 2) return

    const xValues = datasets?.[datasetSelected]?.data[0]?.x || []
    const [p1, p2] = selectedPoints

    const idx1 = xValues.findIndex((x) => x === p1?.x)
    const idx2 = xValues.findIndex((x) => x === p2?.x)

    if (idx1 === -1 || idx2 === -1) return

    const orderedPoints = idx1 < idx2 ? [idx1, idx2] : [idx2, idx1]
    setPoints(orderedPoints)
  }

  const handleCloseDialog = () => {
    setInterpolationType("")
    setPoints([])
    setRange({ min: -1000, max: 200 })
    setPolynomialOrder(1)
    onClose()
  }

  useEffect(() => {
    setRange({ min: start, max: end })
  }, [start, end])

  return (
    <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
      <DialogTitle>
        Interpolação em {datasets?.[datasetSelected]?.name || "conjunto desconhecido"}
      </DialogTitle>
      <DialogContent>
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