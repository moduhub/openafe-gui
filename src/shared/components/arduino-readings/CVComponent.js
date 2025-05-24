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

export const CVComponent = () => {
  const {
    isConnected,
    isReading, handleSetIsReading
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

  const validateField = (field, value) => {
    if (field === "name" && !value.trim())
      return "Name cannot be empty."
    if (Number.isNaN(value))
      return "Invalid entry."
    return ""
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
      StartReading(handleSetIsReading, currentParams, experimentType)
      if (!isMinimized)
        setIsMinimized()
      if (!isMinimizedDataset)
        setIsMinimizedDataset()
    }
    else console.log("It is not possible to start, process in progress")
  }

  return (
    <>
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
              label={`${field
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}`}
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
      <Box width="100%" display="flex" justifyContent="center" gap={3}>
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
    </>
  )
}