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
  Tooltip,
} from "@mui/material"

import { useDatasetsContext } from "../../contexts"

import {
  calculatePolynomialInterpolation,
  calculateGaussianInterpolationRBF,
  calculateGaussianInterpolationLS,
  calculateLogSplineInterpolation,
} from "../../math-functions/"
import newStyled from "@emotion/styled"

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

  const [interpolationType, setInterpolationType] = useState("")
  const [points, setPoints] = useState([])
  const [range, setRange] = useState([start, end])
  const [polynomialOrder, setPolynomialOrder] = useState(1)
  const [gaussianMethod, setGaussianMethod] = useState("rbf")
  const [ref, setRef] = useState("cvChart")

  const type = datasets?.[datasetSelected]?.type
  const isLogsplineDisabled = type === "CV" || (type === "EIS" && ref === "nyquist")

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
      const points = []
      let current = xStart
      while (current <= xEnd + step / 2) { 
        points.push(Number(current.toFixed(12)))
        current += step
      }
      return points
      }
  }

  const handleConfirmInterpolation = () => {
    const ds = datasets?.[datasetSelected]?.data[0] || {}
    let xValues = []
    let yValues = []
    let isLogX = false
    let isYdB = false
    let interpRangeX = []
    let interpX = []
    let interpY = []

/*
    if (ref === "cvChart") {
      xValues = ds.x || []
      yValues = ds.y || []

      const [startIdx, endIdx] = points[0] < points[1] ? points : [points[1], points[0]]
      const [startValue, endValue] = ds.x[startIdx] < ds.x[endIdx] ? [ds.x[startIdx],ds.x[endIdx]] : [ds.x[endIdx],ds.x[startIdx]]
      for (let x = startValue; x <= endValue; x += 1) interpRangeX.push(x)     

      interpX = xValues.slice(startIdx, endIdx + 1)
      interpY = yValues.slice(startIdx, endIdx + 1)
      isLogX = false
      isYdB = false
    }
    else{
      if (ref === "bodeMod") {
        xValues = ds.omega || []
        yValues = ds.modZ || []
        isLogX = true
        isYdB = true
      } 
      else if (ref === "bodeAng") {
        xValues = ds.omega || []
        yValues = ds.angZ || []
        isLogX = true
        isYdB = false
      } 
      else if (ref === "nyquist") {
        xValues = ds.realZ || []
        yValues = ds.imagZ || []
        isLogX = false
        isYdB = false
      }
    
      const [start, end] = range[0] < range[1] ? [range[0], range[1]] : [range[1], range[0]]

      const filtered = xValues.map((x, i) => ({ x, y: yValues[i] }))
        .filter(({ x }) => x >= start && x <= end)

      interpX = filtered.map(p => p.x)
      interpY = filtered.map(p => p.y)

      if (isYdB) 
        interpY = interpY.map(v => Math.max(v, 1e-12))

      let nPoints = interpX.length
      if (isLogX && ds.omega) {
        const stepForADecade = datasets[datasetSelected]?.params?.stepForADecade || 10
        const decades = Math.log10(interpX[interpX.length - 1]) - Math.log10(interpX[0])
        nPoints = Math.max(10, Math.round(decades * stepForADecade))
      }

      interpRangeX = generateInterpX(interpX[0], interpX[interpX.length - 1], nPoints, isLogX)
    }   
*/ 

    //Linear
    if (["cvChart", "nyquist"].includes(ref)) {
      const [startIdx, endIdx] = points[0] < points[1] ? points : [points[1], points[0]]
      
      let xValues = []
      let yValues = []
      let startValue = 0
      let endValue = 0

      switch (ref) {
        case "cvChart":
          xValues = ds.x || []
          yValues = ds.y || [];
          [startValue, endValue] = ds.x[startIdx] < ds.x[endIdx]
            ? [ds.x[startIdx], ds.x[endIdx]]
            : [ds.x[endIdx], ds.x[startIdx]]
          break

        case "nyquist":
          xValues = ds.realZ || []
          yValues = ds.imagZ || [];
          [startValue, endValue] = ds.realZ[startIdx] < ds.realZ[endIdx]
            ? [ds.realZ[startIdx], ds.realZ[endIdx]]
            : [ds.realZ[endIdx], ds.realZ[startIdx]]
          break
      }

      for (let x = startValue; x <= endValue; x += 1) interpRangeX.push(x)

      interpX = xValues.slice(startIdx, endIdx + 1)
      interpY = yValues.slice(startIdx, endIdx + 1)
      isLogX = false
      isYdB = false
    }
    // Nonlinear
    else{
      switch (ref) {
        case "bodeMod":
          xValues = ds.omega || []
          yValues = ds.modZ || []
          isLogX = true
          isYdB = true
          break

        case "bodeAng":
          xValues = ds.omega || []
          yValues = ds.angZ || []
          isLogX = true
          isYdB = false
          break
      }
    
      const [start, end] = range[0] < range[1] 
        ? [range[0], range[1]] 
        : [range[1], range[0]]

      const filtered = xValues.map((x, i) => ({ x, y: yValues[i] }))
        .filter(({ x }) => x >= start && x <= end)

      interpX = filtered.map(p => p.x)
      interpY = filtered.map(p => p.y)

      if (isYdB) interpY = interpY.map(v => Math.max(v, 1e-12))

      let nPoints = interpX.length
      if (isLogX && ds.omega) {
        const stepForADecade = datasets[datasetSelected]?.params?.stepForADecade || 10
        const decades = Math.log10(interpX[interpX.length - 1]) - Math.log10(interpX[0])
        nPoints = Math.max(10, Math.round(decades * stepForADecade))
      }

      interpRangeX = generateInterpX(interpX[0], interpX[interpX.length - 1], nPoints, isLogX)
    }

    let result
    if (interpolationType === "polinomial") {
      result = calculatePolynomialInterpolation(interpX, interpY, polynomialOrder, interpRangeX)
    } else if (interpolationType === "gaussiana") {
      result = gaussianMethod === "rbf"
        ? calculateGaussianInterpolationRBF(interpX, interpY, interpRangeX)
        : calculateGaussianInterpolationLS(interpX, interpY, interpRangeX, ref === "bodeMod")
    } else if (interpolationType === "logspline") {
      result = calculateLogSplineInterpolation(interpX, interpY, interpRangeX)
    }
    let interpolatedY = result.interpolatedY
    if (isYdB) {
      interpolatedY = interpolatedY.map(v => 20 * Math.log10(Math.max(v, 1e-12)))
    }

    const newInterpolation = {
      type: interpolationType,
      typeCalculate:
        interpolationType === "polinomial"
          ? "Vandermonde"
          : interpolationType === "logspline"
            ? "Spline"
            : (gaussianMethod === "rbf") ? "RBF" : "LS",
      order: polynomialOrder?? undefined,
      sigma: result.sigma?? undefined,
      mu: result.mu?? undefined,
      amplitude: result.amplitude?? undefined,
      coefficients: result.coefficients ?? undefined,
      logKnots: result.logKnots?? undefined,
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
              ? `Interpolation ${polynomialOrder}° grau`
              : interpolationType === "logspline"
                ? `Interpolation Log Spline`
                : `Interpolation Gaussian (${gaussianMethod === "rbf" ? "RBF" : "LS"}) (σ=${result.sigma})`,
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

  let xValues = []
  if (ref === "cvChart") {
    xValues = datasets?.[datasetSelected]?.data[0]?.x || []
  } else if (ref === "bodeMod" || ref === "bodeAng") {
    xValues = datasets?.[datasetSelected]?.data[0]?.omega || []
  } else if (ref === "nyquist") {
    xValues = datasets?.[datasetSelected]?.data[0]?.realZ || []
  }

  const isLogX = ref === "bodeMod" || ref === "bodeAng"
  const logMin = Math.log10(Math.min(...xValues))
  const logMax = Math.log10(Math.max(...xValues))

  const sliderValue = isLogX ? range.map(v => Math.log10(v)) : range

  const onSliderChange = (_, newValue) => 
    setRange(isLogX ? newValue.map(v => Math.pow(10, v)) : newValue)

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, my: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Type of Interpolation</InputLabel>
          <Select
            value={interpolationType}
            label="Type of Interpolation"
            onChange={handleInterpolationTypeChange}
          >
            <MenuItem value="polinomial">Polynomial</MenuItem>
            {(ref === "bodeMod" || ref === "bodeAng") ? (
              <Tooltip title="Gaussian interpolation is not available for logarithmic plots.">
                <span>
                  <MenuItem value="gaussiana" disabled>Gaussian</MenuItem>
                </span>
              </Tooltip>
            ) : (
              <MenuItem value="gaussiana">Gaussian</MenuItem>
            )}
            {type === "CVW" || (type === "EIS" && ref === "nyquist") ? (
              <Tooltip title="Logarithmic Spline interpolation is not available.">
                <span>
                  <MenuItem value="logspline" disabled>Logarithmic Spline</MenuItem>
                </span>
              </Tooltip>
            ) : (
              <MenuItem value="logspline">Logarithmic Spline</MenuItem>
            )}
          </Select>
        </FormControl>
      </Box>

      {(interpolationType === "polinomial" || interpolationType === "gaussiana" || interpolationType === "logspline") && (
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
            value={sliderValue}
            onChange={onSliderChange}
            min={isLogX ? logMin : Math.min(...xValues)}
            max={isLogX ? logMax : Math.max(...xValues)}
            step={isLogX ? 0.01 : step}
            scale={isLogX ? (v => Math.pow(10, v)) : (v => v)}
            valueLabelFormat={isLogX ? (v => Number(Math.pow(10, v)).toPrecision(3)) : (v => v)}
            valueLabelDisplay="auto"
            marks={[
              {
                value: isLogX ? logMin : Math.min(...xValues),
                label: isLogX ? Number(Math.pow(10, logMin)).toPrecision(2) : Math.min(...xValues),
              },
              {
                value: isLogX ? logMax : Math.max(...xValues),
                label: isLogX ? Number(Math.pow(10, logMax)).toPrecision(2) : Math.max(...xValues),
              },
            ]}
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