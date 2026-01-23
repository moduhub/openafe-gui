import { TextField, Box, List, ListItem, Button } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StopIcon from '@mui/icons-material/Stop'
import { useState } from "react"
import { StartReading, FinishReading } from '../../../arduino'
import {
  useArduinoContext,
  useDatasetsContext,
  useDashboardContext,
} from '../../contexts'

/**
 * @brief Component responsible for receiving user inputs 
 * and converting them into command structure to send via electron
 * 
 * Behavior:
 * - Displays input fields for dataset name and parameters.
 * - Validates inputs to ensure name is not empty and parameters are valid numbers.
 * - Provides buttons to start and stop reading from Arduino.
 * - Disables buttons based on connection and reading status.
 */
export const ArduinoReadingComponent = () => {
  const {
    isConnected,
    isReading, handleSetIsReading,
    isDummy,
    portConnected
  } = useArduinoContext()
  const {
    currentParams, handleCurrentParams,
    currentName, handleCurrentName,
    datasets,
    experimentType
  } = useDatasetsContext()
  const {
    tabArduinoIsMinimized: isMinimized,
    handleToggleTabArduinoMinimized: setIsMinimized,
    tabDatasetsIsMinimized: isMinimizedDataset,
    handleToggleTabDatasetsMinimized: setIsMinimizedDataset,
  } = useDashboardContext()

  const [errors, setErrors] = useState({})

  const formatWithPrefix = (value, unit = '') => {
    if (value === null) return 'N/A'
    const abs = Math.abs(value)
    
    if (abs >= 1) return `${value.toFixed(3)} ${unit}`
    if (abs >= 1e-3) return `${(value * 1e3).toFixed(1)} m${unit}`
    if (abs >= 1e-6) return `${(value * 1e6).toFixed(1)} µ${unit}`
    if (abs >= 1e-9) return `${(value * 1e9).toFixed(1)} n${unit}`
    if (abs >= 1e-12) return `${(value * 1e12).toFixed(1)} p${unit}`
    return `${value} ${unit}`
  }

  const formatOhms = (value) => {
    const iFS = 0.9 / value
    const resistance = value >= 1000 ? `${(value / 1000).toFixed(0)} kΩ` : `${value} Ω`
    return `FS: ${formatWithPrefix(iFS, 'A')} | Gtia: ${resistance}`
  }

  const validateField = (field, value) => {
    if (field === "name" && !value.trim())
      return "Name cannot be empty."
    if (Number.isNaN(value))
      return "Invalid entry."
    return ""
  }

  const validateParams = (params, type) => {
    const errors = {}

    const { settlingTime, startingPotential, endingPotential, stepPotential, scanRate, dutyCycle, cycles } = params

    if (settlingTime < 0)
      errors.settlingTime = "Settling time must be greater than 0 ms."
    if (startingPotential > endingPotential) 
      errors.startingPotential = "Starting potential cannot be greater than ending potential."
    if (stepPotential < 1) 
      errors.stepPotential = "Step potential must be at least 1 mV."
    
    const stepTime = (stepPotential / scanRate) * 1000.0 // ms
    if (type === "CVW") {
      if (stepTime < 1) 
        errors.scanRate = "Step time per cycle must be at least 1 ms."
      if (!Number.isInteger(cycles) || cycles < 1)
        errors.cycles = "Cycles must be an integer greater or equal to 1."
    }

    if (type === "DPV" || type === "SWV") {
      if (dutyCycle <= 0 || dutyCycle >= 100) 
        errors.dutyCycle = "Duty cycle must be between 0 and 100."
      else {
        const fraction = dutyCycle / 100
        const minSlice = stepTime * Math.min(fraction, 1 - fraction)
        if (minSlice < 1) 
          errors.dutyCycle = "Duty cycle produces a slice shorter than 1 ms."
      }
    }

    return errors
  }

  const handleChange = (field) => (e) => {
    const value = field === "name" ? e.target.value : Number(e.target.value)

    handleCurrentParams((prevState) => ({
      ...prevState,
      [field]: value,
    }))

    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: validateField(field, value),
    }))
  }

  const handleStartReading = () => {
    const newErrors = {}
    let hasError = false

    if (!currentName.trim()) {
      newErrors.name = "Name cannot be empty."
      hasError = true
    }

    Object.entries(currentParams).forEach(([field, value]) => {
      const error = validateField(field, value)
      if (error) {
        newErrors[field] = error
        hasError = true
      }
    })
    if (hasError) {
      setErrors(newErrors)
      return
    }

    const paramErrors = validateParams(currentParams, experimentType)
    if (Object.keys(paramErrors).length > 0) {
      setErrors(paramErrors)
      return
    }

    setErrors({})

    const existingNames = datasets.map((dataset) => dataset.name)
    let newName = currentName
    while (existingNames.includes(newName)) {
      const match = newName.match(/\((\d+)\)$/)
      if (match) {
        const count = parseInt(match[1], 10)
        newName = `${newName.replace(/\(\d+\)$/, "")}(${(count + 1).toString().padStart(2, '0')})`
      } else {
        newName = `${newName} (01)`
      }
    }

    handleCurrentName(newName)

    if (!isReading) {
      StartReading(isDummy, handleSetIsReading, currentParams, experimentType, 200, portConnected)
      if (!isMinimized)
        setIsMinimized()
      if (!isMinimizedDataset)
        setIsMinimizedDataset()
    }
    else console.log("It is not possible to start, process in progress")
  }

  return ( // Small Windows: 440px
    <Box display="flex" flexDirection="column" height="440px">
      
      <Box flex="1" overflow="auto">
        <List>
          <ListItem>
            <TextField
              label="Name"
              value={currentName}
              onChange={(e) => handleCurrentName(e.target.value)}
              size="small"
              fullWidth
              error={!!errors.name}
              helperText={errors.name}
            />
          </ListItem>
          {Object.keys(currentParams).map((field) => (
            <ListItem key={field}>
              <TextField
                label={field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                value={currentParams[field]}
                onChange={handleChange(field)}
                type="number"
                size="small"
                fullWidth
                error={!!errors[field]}
                helperText={errors[field]}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Box flex="0" display="flex" justifyContent="center" gap={3}>
        <Button
          onClick={handleStartReading}
          variant="contained"
          color="success"
          size="small"
          disabled={isReading || !isConnected}
          style={{ opacity: isReading ? 0.5 : 1 }}
        >
          <PlayArrowIcon />
        </Button>
        <Button
          onClick={FinishReading}
          variant="contained"
          color="error"
          size="small"
          disabled={!isReading}
          style={{ opacity: !isReading ? 0.5 : 1 }}
        >
          <StopIcon />
        </Button>
      </Box>
    </Box>
  )
}