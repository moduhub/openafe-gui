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
  const [ref, setRef] = useState("cvChart")

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

    const [p1, p2] = selectedPoints
    const currentRef = p1.ref || "cvChart"
    setRef(currentRef)

    let xValues = []
    let yValues = []

    const ds = datasets?.[datasetSelected]?.data[0] || {}

    if (currentRef === "cvChart") {
      xValues = ds.x || []
      yValues = ds.y || []
    } else if (currentRef === "bodeMod") {
      xValues = ds.omega || []
      yValues = (ds.modZ || []).map(v => 20 * Math.log10(Math.max(v, 1e-12)))
    } else if (currentRef === "bodeAng") {
      xValues = ds.omega || []
      yValues = ds.angZ || []
    } else if (currentRef === "nyquist") {
      xValues = ds.realZ || []
      yValues = ds.imagZ || []
    }

    const idx1 = p1.index
    const idx2 = p2.index

    if (typeof idx1 !== "number" || typeof idx2 !== "number" || idx1 < 0 || idx2 < 0) return

    setPoints([idx1, idx2])
    setRange([xValues[idx1], xValues[idx2]])
  }

  const handleOrderChange = (_, newValue) => {
    setPolynomialOrder(newValue)
  }

  const generateInterpX = (xStart, xEnd, nPoints, isLog) => {
  if (isLog) {
    const logStart = Math.log10(xStart)
    const logEnd = Math.log10(xEnd)
    return Array.from({ length: nPoints }, (_, i) =>
      Math.pow(10, logStart + (logEnd - logStart) * (i / (nPoints - 1)))
    )
  } else {
    return Array.from({ length: nPoints }, (_, i) =>
      xStart + (xEnd - xStart) * (i / (nPoints - 1))
    )
  }
}

  const handleConfirmInterpolation = () => {
    const ds = datasets?.[datasetSelected]?.data[0] || {}
    let xValues = []
    let yValues = []
    let isLogX = false
    let isYdB = false

    if (ref === "cvChart") {
      xValues = ds.x || []
      yValues = ds.y || []
    } else if (ref === "bodeMod") {
      xValues = ds.omega || []
      yValues = ds.modZ || []
      isLogX = true
      isYdB = true
    } else if (ref === "bodeAng") {
      xValues = ds.omega || []
      yValues = ds.angZ || []
      isLogX = true
    } else if (ref === "nyquist") {
      xValues = ds.realZ || []
      yValues = ds.imagZ || []
    }

    // Garante ordem dos índices
    const [startIdx, endIdx] = points[0] < points[1] ? points : [points[1], points[0]]
    const interpX = xValues.slice(startIdx, endIdx + 1)
    let interpY = yValues.slice(startIdx, endIdx + 1)

    // Para bodeMod, use valores lineares para interpolação, mas mostre em dB
    if (isYdB) {
      interpY = interpY.map(v => Math.max(v, 1e-12))
    }

    // Densidade de pontos baseada no dataset
    let nPoints = interpX.length
    if (isLogX && ds.omega) {
      // stepForADecade: pontos por década
      const stepForADecade = datasets[datasetSelected]?.params?.stepForADecade || 10
      const decades = Math.log10(interpX[interpX.length - 1]) - Math.log10(interpX[0])
      nPoints = Math.max(10, Math.round(decades * stepForADecade))
    }

    // Gera os Xs para interpolação
    const interpRangeX = generateInterpX(interpX[0], interpX[interpX.length - 1], nPoints, isLogX)

    // Chame a função de interpolação correta
    let result
    if (interpolationType === "polinomial") {
      result = calculatePolynomialInterpolation(
        interpX, interpY, polynomialOrder, interpRangeX
      )
    } else if (interpolationType === "gaussiana") {
      result = gaussianMethod === "rbf"
        ? calculateGaussianInterpolationRBF(interpX, interpY, interpRangeX)
        : calculateGaussianInterpolationLS(interpX, interpY, interpRangeX, ref === "bodeMod")
    }

    // Para bodeMod, converta Y interpolado para dB para exibir
    let interpolatedY = result.interpolatedY
    if (isYdB) {
      interpolatedY = interpolatedY.map(v => 20 * Math.log10(Math.max(v, 1e-12)))
    }

    // Salve a interpolação no dataset
    const newInterpolation = {
      type: interpolationType,
      typeCalculate: (interpolationType === "polinomial") ? "Vandermonde" : (gaussianMethod === "rbf") ? "RBF" : "LS",
      order: interpolationType === "polinomial" ? polynomialOrder : undefined,
      sigma: interpolationType === "gaussiana" ? result.sigma : undefined,
      mu: interpolationType === "gaussiana" ? result.mu : undefined,
      amplitude: interpolationType === "gaussiana" ? result.amplitude : undefined,
      coefficients: result.coefficients ?? undefined,
      isVisible: true,
      ref: ref,
      data: [
        {
          x: interpRangeX,
          y: interpolatedY,
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
    handleCloseDialog()
  }

  const handleCloseDialog = () => {
    setInterpolationType("")
    setPoints([])
    setRange([start, end])
    setPolynomialOrder(1)
    onClose()
  }

  const getSliderProps = (xValues, ref) => {
    if (ref === "bodeMod" || ref === "bodeAng") {
      // Eixo logarítmico
      const min = Math.log10(Math.min(...xValues))
      const max = Math.log10(Math.max(...xValues))
      return {
        min,
        max,
        step: 0.01,
        scale: v => Math.pow(10, v),
        valueLabelFormat: v => Number(Math.pow(10, v)).toPrecision(3),
        marks: [
          { value: min, label: Number(Math.pow(10, min)).toPrecision(2) },
          { value: max, label: Number(Math.pow(10, max)).toPrecision(2) }
        ]
      }
    } else {
      // Linear
      const min = Math.min(...xValues)
      const max = Math.max(...xValues)
      return {
        min,
        max,
        step: step,
        scale: v => v,
        valueLabelFormat: v => v,
        marks: [
          { value: min, label: min },
          { value: max, label: max }
        ]
      }
    }
  }

  let xValues = []
  if (ref === "cvChart") {
    xValues = datasets?.[datasetSelected]?.data[0]?.x || []
  } else if (ref === "bodeMod" || ref === "bodeAng") {
    xValues = datasets?.[datasetSelected]?.data[0]?.omega || []
  } else if (ref === "nyquist") {
    xValues = datasets?.[datasetSelected]?.data[0]?.realZ || []
  }
  const sliderProps = getSliderProps(xValues, ref)

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
            value={
              (ref === "bodeMod" || ref === "bodeAng")
                ? range.map(v => Math.log10(v))
                : range
            }
            onChange={(_, newValue) => {
              setRange(
                (ref === "bodeMod" || ref === "bodeAng")
                  ? newValue.map(v => Math.pow(10, v))
                  : newValue
              )
            }}
            min={sliderProps.min}
            max={sliderProps.max}
            step={sliderProps.step}
            scale={sliderProps.scale}
            valueLabelFormat={sliderProps.valueLabelFormat}
            valueLabelDisplay="auto"
            marks={sliderProps.marks}
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