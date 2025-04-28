import { useState } from 'react'
import {
  Box, FormControl, InputLabel, Select, MenuItem, Button
} from '@mui/material'

export const InterpolationComponent = ({ xArray, yArray }) => {
  const [interpolationType, setInterpolationType] = useState('')
  const [point1Index, setPoint1Index] = useState('')
  const [point2Index, setPoint2Index] = useState('')

  const formatPoint = (val) => Number(val).toFixed(1)

  const handleInterpolationTypeChange = (e) => {
    setInterpolationType(e.target.value)
  }

  const handlePoint1Change = (e) => {
    setPoint1Index(e.target.value)
    console.log("Alterado 1")
  }

  const handlePoint2Change = (e) => {
    setPoint2Index(e.target.value)
    console.log("Alterado 2")
  }

  const handleCalculate = () => {
    console.log(`Interpolando: [${point1Index}  ${point2Index}] ${interpolationType}`)
    // Aqui você chama sua função de interpolação
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <FormControl fullWidth>
        <InputLabel id="interpolation-type-label">Tipo de Interpolação</InputLabel>
        <Select
          labelId="interpolation-type-label"
          value={interpolationType}
          label="Tipo de Interpolação"
          onChange={handleInterpolationTypeChange}
        >
          <MenuItem value="polinomial">Polinomial</MenuItem>
          <MenuItem value="gaussiana">Gaussiana</MenuItem>
          <MenuItem value="exponencial">Exponencial</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel id="point1-label">Ponto 1</InputLabel>
        <Select
          labelId="point1-label"
          value={point1Index}
          label="Ponto 1"
          onChange={handlePoint1Change}
        >
          {xArray.map((_, idx) => (
            <MenuItem key={idx} value={idx}>
              {idx}: ({formatPoint(xArray[idx])}, {formatPoint(yArray[idx])})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel id="point2-label">Ponto 2</InputLabel>
        <Select
          labelId="point2-label"
          value={point2Index}
          label="Ponto 2"
          onChange={handlePoint2Change}
        >
          {xArray.map((_, idx) => (
            <MenuItem key={idx} value={idx}>
              {idx}: ({formatPoint(xArray[idx])}, {formatPoint(yArray[idx])})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" onClick={handleCalculate}>
        Calcular
      </Button>
    </Box>
  )
}
