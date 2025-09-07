import { useState, useEffect } from 'react'
import { 
  Button, 
  Typography,
  Box
} from '@mui/material'

import { useDatasetsContext } from '../../contexts'

/**
 * @brief Internal component of the point selection dialog, 
 *  responsible for calculating the area over the graph within 
 *  the range of the selected points.
 *
 * @param {boolean} open - Whether the dialog is currently visible
 * @param {() => void} onClose - Callback to trigger when the dialog is closed
 * @param {{ x: number, y: number }[]} selectedPoints - Array of two points selected for interpolation
 *
 * Behavior:
 * - Calculates the area under the curve between two selected points using the trapezoidal rule.
 * - Displays the calculated area in engineering notation (V·A).
 * - Provides a button to save the calculated area as a marker in the dataset.
 */
export const AreaTab = ({ open, onClose, selectedPoints }) => {
  const { datasets, datasetSelected } = useDatasetsContext()

  const [points, setPoints] = useState([])
  const [area, setArea] = useState(0)
  const [ref, setRef] = useState('cvChart')

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

  const formatEngineeringNotation = (value) => {
    if (value === 0) return "0"

    const exponent = Math.floor(Math.log10(Math.abs(value)) / 3) * 3
    const scaled = value / Math.pow(10, exponent);
  
    return `${scaled.toFixed(3)}e${exponent}`
  }

  const updateData = () => {
  if (!selectedPoints || selectedPoints.length < 2) return
  const [p1, p2] = selectedPoints
  const currentRef = p1.ref || 'cvChart'
  setRef(currentRef)

  const idx1 = p1.index
  const idx2 = p2.index

  if (typeof idx1 !== "number" || typeof idx2 !== "number" || idx1 < 0 || idx2 < 0) return

  setPoints([idx1, idx2])
}

  useEffect(() => {
    if (points.length < 2) {
      setArea(0)
      return
    }

    const ds = datasets?.[datasetSelected]?.data[0] || {}
    let xValues = []
    let yValues = []

    if (ref === 'cvChart') {
      xValues = ds.x || []
      yValues = ds.y || []
    } else if (ref === 'bodeMod') {
      xValues = ds.omega || []
      yValues = (ds.modZ || []).map(v => 20 * Math.log10(Math.max(v, 1e-12)))
    } else if (ref === 'bodeAng') {
      xValues = ds.omega || []
      yValues = ds.angZ || []
    } else if (ref === 'nyquist') {
      xValues = ds.realZ || []
      yValues = ds.imagZ || []
    }

    const [start, end] = points[0] < points[1] ? points : [points[1], points[0]]

    let soma = 0
    for (let i = start; i < end; i++) {
      const dx = Math.abs(xValues[i + 1] - xValues[i])
      const yAvg = (yValues[i] + yValues[i + 1]) / 2
      soma += dx * yAvg
    }
    soma *= 1e-9

    setArea(soma)
  }, [points, ref, datasets, datasetSelected])

  const handleConfirmCalculate = () => {
    const [start, end] = points[0] < points[1] ? points : [points[1], points[0]]

    const newAreaMarker = {
      value: area,
      start: start,
      end: end,
      isVisible: true,
      ref: ref 
    }
    datasets[datasetSelected]?.addAreaMarker(newAreaMarker)
  
    handleCloseDialog()
  }

  const handleCloseDialog = ()=>{
    setPoints([])
    onClose()
  }

  return(
    <>
    <Box sx={{ mt: 2 }}>
      <Typography>
        Area: {formatEngineeringNotation(area)}  [ V·A ]
      </Typography>
    </Box>
    <Box sx={{ mt: 2 }}>
      <Button
        onClick={handleConfirmCalculate}
        color="primary"
        variant="contained"
        fullWidth
      >
        Save
      </Button>
    </Box>
    </>
  )
}