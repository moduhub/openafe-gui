import { useState, useEffect } from 'react'
import { 
  Button, 
  Typography,
  Box
} from '@mui/material'

import { useDatasetsContext } from '../../contexts'

/**
 * Area Tab Component
 * Internal component of the point selection dialog, 
 *  responsible for calculating the area over the graph within 
 *  the range of the selected points.
 *
 * @param {boolean} open                              - Whether the dialog is currently visible
 * @param {() => void} onClose                        - Callback to trigger when the dialog is closed
 * @param {{ x: number, y: number }[]} selectedPoints - Array of two points selected for interpolation
 *
 * @returns {JSX.Element}
 */
export const AreaTab = ({ open, onClose, selectedPoints }) => {
  const { datasets, datasetSelected } = useDatasetsContext()

  const [points, setPoints] = useState([])
  const [area, setArea] = useState(0)

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

  useEffect(() => {
    if (points.length < 2) {
      setArea(0)
      return
    }

    const xValues = datasets?.[datasetSelected]?.data[0]?.x || []
    const yValues = datasets?.[datasetSelected]?.data[0]?.y || []

    const [start, end] = points[0] < points[1] ? points : [points[1], points[0]]

    let soma = 0
    for (let i = start; i < end; i++) {
      
      const dx = Math.abs(xValues[i + 1] - xValues[i])
      const yAvg = (yValues[i] + yValues[i + 1]) / 2
      soma += dx * yAvg  // signed area contribution: negative if yAvg < 0
    }
    soma *= 1e-9  // scale units (m * u -> n)

    setArea(soma)
  }, [points])

  const formatEngineeringNotation = (value) => {
    if (value === 0) return "0"

    const exponent = Math.floor(Math.log10(Math.abs(value)) / 3) * 3
    const scaled = value / Math.pow(10, exponent);
  
    return `${scaled.toFixed(3)}e${exponent}`
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
  }

  const handleConfirmCalculate = () => {
    const [start, end] = points[0] < points[1] ? points : [points[1], points[0]]

    const newAreaMarker = {
      value: area,
      start: start,
      end: end,
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
        Area: {formatEngineeringNotation(area)}  [ mV*uA ]
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