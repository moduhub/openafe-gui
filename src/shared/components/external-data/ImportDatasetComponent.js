import React, { useState } from 'react'
import {
  Box,
  Typography
} from '@mui/material'

import { useDatasetsContext } from '../../contexts'

export const ImportDataset = ({ onClose }) => {
  const { datasets, handleSetDataset } = useDatasetsContext()
  const [error, setError] = useState('')

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.type !== 'application/json') {
      setError('Por favor, selecione um arquivo JSON válido.')
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
          setError('O arquivo JSON contém datasets inválidos.')
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
        setError('Erro ao processar o arquivo JSON. Verifique o formato.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <Box>
      <Typography variant="body1" gutterBottom>
        Selecione um arquivo JSON para importar datasets.
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