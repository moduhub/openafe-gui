import { useState, useEffect } from 'react'
import {
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Button,
  Box,
  Typography,
  Switch,
  FormControlLabel
} from '@mui/material'

import { useDatasetsContext } from '../../contexts'

import { exportJSON } from './export-formats/exportJSON'
import { exportXLSX } from './export-formats/exportXLSX'
import { exportCSV } from './export-formats/exportCSV'
import { exportYAML } from './export-formats/exportYAML'
import { exportJPEG } from './export-formats/exportJPEG'
import { exportPNG } from './export-formats/exportPNG'

/**
 * A component that allows the user to export selected datasets in either JSON or Excel format
 *
 * @param {() => void} onClose           - Callback to close the export dialog
 * @param {number|string} [defaultIndex] - Optional dataset key to be selected by default on open
 *
 * @returns {JSX.Element}
 */
export const ExportDataset = ({ onClose, defaultIndex }) => {
  const { datasets } = useDatasetsContext()
  const datasetKeys = Object.keys(datasets)

  const [selectedKeys, setSelectedKeys] = useState([])
  const [format, setFormat] = useState('json')
  const [includeInterpPoints, setIncludeInterpPoints] = useState(true)

  useEffect(() => {
    if (defaultIndex != null) {
      setSelectedKeys([String(defaultIndex)])
    }
  }, [defaultIndex])

  const handleChange = (event) => {
    const {
      target: { value },
    } = event
    setSelectedKeys(
      typeof value === 'string' ? value.split(',') : value
    )
  }

  const handleSave = async () => {
    if (selectedKeys.length === 0) return

    for (const key of selectedKeys) {
      const ds = datasets[key]
      if (!ds) continue

      const baseName = ds.name || `dataset-${key}`

      if (format === 'json') {
        exportJSON(ds, baseName)
        continue
      }

      if (format === 'excel') {
        exportXLSX(ds, baseName, includeInterpPoints)
        continue
      }

      if (format === 'csv') {
        exportCSV(ds, baseName, includeInterpPoints)
        continue
      }

      if (format === 'yaml') {
        exportYAML(ds, baseName)
        continue
      }

      if (format === 'png') {
        await exportPNG(ds, baseName)
        continue
      }

      if (format === 'jpeg') {
        await exportJPEG(ds, baseName)
        continue
      }
    }

    onClose()
  }

  return (
    <Box>
      <FormControl fullWidth margin="normal">
        <Typography variant="subtitle1" gutterBottom>
          Datasets:
        </Typography>
        <Select
          labelId="dataset-multi-label"
          multiple
          value={selectedKeys}
          onChange={handleChange}
          renderValue={(selected) => selected.map((key) => datasets[key]?.name || key).join(', ')}
        >
          {datasetKeys.map((key) => (
            <MenuItem key={key} value={key}>
              <Checkbox checked={selectedKeys.indexOf(key) > -1} />
              <ListItemText primary={datasets[key].name || key} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <Typography variant="subtitle1" gutterBottom>
          File format:
        </Typography>
        <Select
          labelId="format-label"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        >
          <MenuItem value="json">JSON ( Default )</MenuItem>
          <MenuItem value="excel">XLSX ( Excel )</MenuItem>
          <MenuItem value="png">PNG</MenuItem>
          <MenuItem value="jpeg">JPEG</MenuItem>
          <MenuItem value="csv">CSV</MenuItem>
          <MenuItem value="yaml">YAML</MenuItem>
        </Select>
      </FormControl>

      {(format === 'excel' || format === 'csv') && (
        <FormControlLabel
          control={
            <Switch
              checked={includeInterpPoints}
              onChange={(e) => setIncludeInterpPoints(e.target.checked)}
              color="primary"
            />
          }
          label="Incluir pontos das interpolações"
          sx={{ mt: 2 }}
        />
      )}

      <Button
        onClick={handleSave}
        color="primary"
        variant="contained"
        fullWidth
        disabled={selectedKeys.length === 0} // <-- Adicionado aqui
      >
        Save
      </Button>
    </Box>
  )
}