import { useState, useEffect } from "react"
import {
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

import { 
  calculatePolynomialInterpolation,
  calculateGaussianInterpolationRBF,
  calculateGaussianInterpolationLS
} from "../../math-functions/"

/**
 * Interpolation Tab Component
 * (polynomial or Gaussian) to a selected dataset using two selected points
 * Internal component of the point selection dialog, 
 *  responsible for calculating interpolations within 
 *  the range of the selected points.
 *
 * @param {boolean} open                              - Whether the dialog is currently visible
 * @param {() => void} onClose                        - Callback to trigger when the dialog is closed
 * @param {{ x: number, y: number }[]} selectedPoints - Array of two points selected for interpolation
 *
 * @returns {JSX.Element}
 */
export const InterpolationTab = ({ open, onClose, selectedPoints }) => {
  const { datasets, datasetSelected } = useDatasetsContext()

  const params = datasets?.[datasetSelected]?.params || {}
  const start = params.startPotential ?? 0
  const end = params.endPotential ?? 0
  const step = params.step ?? 1
  const delta = end - start
  const minStart = start - 0.5 * delta
  const maxEnd = end + 0.5 * delta

  const [interpolationType, setInterpolationType] = useState("")
  const [points, setPoints] = useState([])
  const [range, setRange] = useState([start, end])
  const [polynomialOrder, setPolynomialOrder] = useState(1)
  const [gaussianMethod, setGaussianMethod] = useState("rbf") // "rbf" or "ls"

  // Manage inert attribute for accessibility
  useEffect(() => {
    const root = document.querySelector("#root")
    if (open) {
      root?.setAttribute("inert", "true")
      updateData()
    } else {
      root?.removeAttribute("inert")
    }
    return () => {
      root?.removeAttribute("inert")
    }
  }, [open, selectedPoints])

  const handleInterpolationTypeChange = (event) => {
    const type = event.target.value
    setInterpolationType(type)
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
    setRange([xValues[idx1], xValues[idx2]])
  }

  const handleOrderChange = (_, newValue) => {
    setPolynomialOrder(newValue)
  }

  const handleConfirmInterpolation = () => {
    let result
    if (interpolationType === "polinomial" && points.length === 2) {
      result = calculatePolynomialInterpolation(
        points,
        datasets,
        datasetSelected,
        polynomialOrder,
        { min: range[0], max: range[1] }
      )
    } 
    else if (interpolationType === "gaussiana" && points.length === 2) {
      result = gaussianMethod === "rbf"
        ? calculateGaussianInterpolationRBF(
            points,
            datasets,
            datasetSelected,
            { min: range[0], max: range[1] }
          )
        : calculateGaussianInterpolationLS(
            points,
            datasets,
            datasetSelected,
            { min: range[0], max: range[1] }
          )
    }

    if (result) {
      const newInterpolation = {
        type: interpolationType,
        typeCalculate: (interpolationType === "polinomial")? "Vandermonde" : (gaussianMethod === "rbf")?"RBF":"LS",
        order: interpolationType === "polinomial" ? polynomialOrder : undefined,
        sigma: interpolationType === "gaussiana" ? result.sigma : undefined,
        mu: interpolationType === "gaussiana" ? result.mu : undefined,
        amplitude: interpolationType === "gaussiana" ? result.amplitude : undefined,
        coefficients: result.coefficients ?? undefined,
        isVisible: true,
        data: [
          {
            x: result.interpolatedX,
            y: result.interpolatedY,
            mode: "lines",
            line: { dash: "dot" },
            name:
              interpolationType === "polinomial"
                ? `Interpolação ${polynomialOrder}° grau`
                : `Interpolação Gaussiana (${gaussianMethod === "rbf" ? "RBF" : "MMQ"}) (σ=${result.sigma})`,
          },
        ],
      }

      datasets[datasetSelected]?.addInterpolation(newInterpolation)
    }

    handleCloseDialog()
  }

  const handleCloseDialog = () => {
    setInterpolationType("")
    setPoints([])
    setRange([start, end])
    setPolynomialOrder(1)
    onClose()
  }

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, my: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Type of Interpolation</InputLabel>
          <Select
            value={interpolationType}
            label="Tipo de Interpolação"
            onChange={handleInterpolationTypeChange}
          >
            <MenuItem value="polinomial">Polynomial</MenuItem>
            <MenuItem value="gaussiana">Gaussian</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {(interpolationType === "polinomial" || interpolationType === "gaussiana") && (
        <Box sx={{ mt: 2 }}>
          {interpolationType === "polinomial" && (
            <>
              <Typography gutterBottom>Order of the Polynomial:</Typography>
              <Slider
                value={polynomialOrder}
                onChange={handleOrderChange}
                min={1}
                max={5}
                step={1}
                valueLabelDisplay="auto"
                sx={{ mb: 2 }}
              />
            </>
          )}
          {interpolationType === "gaussiana" && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Gaussian Method</InputLabel>
              <Select
                value={gaussianMethod}
                label="Gaussian Method"
                onChange={(e) => setGaussianMethod(e.target.value)}
              >
                <MenuItem value="rbf">Radial Basis Function (RBF)</MenuItem>
                <MenuItem value="ls">Least Squares (MMQ)</MenuItem>
              </Select>
            </FormControl>
          )}
          <Typography gutterBottom>Interval of X:</Typography>
          <Slider
            value={range}
            onChange={(_, newValue) => setRange(newValue)}
            min={minStart}
            max={maxEnd}
            step={step}
            valueLabelDisplay="auto"
          />
        </Box>
      )}
      
      <Button
        onClick={handleConfirmInterpolation}
        color="primary"
        variant="contained"
        disabled={!interpolationType}
        fullWidth
      >
        Interpolate
      </Button>
    </>
  )
}