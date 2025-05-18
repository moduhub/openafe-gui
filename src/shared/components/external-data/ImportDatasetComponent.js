import { useState } from 'react'
import {
  Box,
  Typography
} from '@mui/material'

import { useDatasetsContext } from '../../contexts'

/**
 * A component for importing datasets from a JSON file. Validates and integrates datasets,
 * enriching them with visibility controls and interpolation capabilities
 *
 * @param {() => void} onClose - Callback to close the import dialog after successful import
 *
 * @returns {JSX.Element}
 */
export const ImportDataset = ({ onClose }) => {
  const { datasets, handleSetDataset } = useDatasetsContext()
  const [error, setError] = useState('')

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.type !== 'application/json') {
      setError('Please select a valid JSON file.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)
        const newDatasets = Array.isArray(importedData)
          ? importedData
          : [importedData]

        const isValid = newDatasets.every(ds =>
          ds.name && ds.data && Array.isArray(ds.data)
        )
        if (!isValid) {
          setError('The JSON file contains invalid datasets.')
          return
        }

        const existingNames = datasets.map(ds => ds.name)

        const renamedDatasets = newDatasets.map(ds => {
          const baseName = ds.name.trim()
          let newName = baseName
          let counter = 0

          while (existingNames.includes(newName)) {
            counter += 1
            newName = `${baseName} ${counter}`
          }

          existingNames.push(newName)

          return {
            ...ds,
            name: newName,
          }
        })

        // Enriquecer com visible e setIsVisible
        const enriched = renamedDatasets.map(ds => ({
          ...ds,
          visible: typeof ds.visible === 'boolean' ? ds.visible : true,
          setIsVisible: () => {
            handleSetDataset(prev =>
              prev.map(dataset =>
                dataset.name === ds.name
                  ? { ...dataset, visible: !dataset.visible }
                  : dataset
              )
            )
          },
          addInterpolation: (interpolation) => {
            handleSetDataset((prevDatasets) =>
              prevDatasets.map((dataset) =>
                dataset.name === ds.name
                  ? {
                      ...dataset,
                      interpolations: [...dataset.interpolations, interpolation],
                    }
                  : dataset
              )
            )
          },
        }))

        handleSetDataset(prev => [...prev, ...enriched])
        setError('')
        onClose()
      } catch {
        setError('Error processing the JSON file. Check the format.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <Box>
      <Typography variant="body1" gutterBottom>
        Select a JSON file to import datasets.
      </Typography>
      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ marginTop: '16px' }}
      />
      {error && (
        <Typography color="error" variant="body2" style={{ marginTop: '8px' }}>
          {error}
        </Typography>
      )}
    </Box>
  )
}