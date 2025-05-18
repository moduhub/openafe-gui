import { useState, useEffect } from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Button,
  Box
} from '@mui/material'
import * as XLSX from 'xlsx'

import { useDatasetsContext } from '../../contexts'

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

  const handleSave = () => {
    if (selectedKeys.length === 0) return

    selectedKeys.forEach((key) => {
      const ds = datasets[key]
      if (!ds) return

      const baseName = ds.name || `dataset-${key}`

      if (format === 'json') {
        const blob = new Blob([
          JSON.stringify(ds, null, 2)
        ], { type: 'application/json' })

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${baseName}.json`
        link.click()
        return
      }

      if (format === 'excel') {
        const wb = XLSX.utils.book_new()
        const ws = {}
        const merges = []

        ws['A1'] = { v: 'X' }
        ws['B1'] = { v: 'Y' }
        ws['C1'] = { v: '' }
        ws['D1'] = {
          v: 'Parâmetros',
          s: { alignment: { horizontal: 'center', vertical: 'center' } }
        }
        merges.push({ s: { r: 0, c: 3 }, e: { r: 0, c: 4 } })

        let rowPtr = 2
        Object.entries(ds.params || {}).forEach(([k, v]) => {
          ws[`D${rowPtr}`] = { v: k }
          ws[`E${rowPtr}`] = { v: v }
          rowPtr++
        })

        const main = Array.isArray(ds.data) ? ds.data[0] : null
        const xs = main?.x || []
        const ys = main?.y || []
        const dataStart = 2
        xs.forEach((x, i) => {
          const r = dataStart + i
          ws[`A${r}`] = { v: x }
          ws[`B${r}`] = { v: ys[i] !== undefined ? ys[i] : '' }
        })

        const interps = Array.isArray(ds.interpolations)
          ? ds.interpolations
          : []

        interps.forEach((interp, idx) => {
          const startCol = 6 + idx * 3
          const colX = XLSX.utils.encode_col(startCol)
          const colY = XLSX.utils.encode_col(startCol + 1)

          const title =
            interp.type === 'polinomial'
              ? `Polinomial (ord ${interp.order})`
              : interp.type === 'gaussiana'
                ? `Gaussiana`
                : interp.type || 'Interp'
          ws[`${colX}1`] = { v: title, s: { alignment: { horizontal: 'center', vertical: 'center' } } }
          merges.push({ s: { r: 0, c: startCol }, e: { r: 0, c: startCol + 1 } })

          let pStr = ''
          if (interp.type === 'polinomial' && Array.isArray(interp.coefficients)) {
            pStr = interp.coefficients.map((c, i) => `a${i}: ${c}`).join(' ')
          } else if (interp.type === 'gaussiana') {
            pStr = `σ: ${interp.sigma} μ: ${interp.mu} A: ${interp.amplitude}`
          }
          ws[`${colX}2`] = { v: pStr, s: { alignment: { horizontal: 'center', vertical: 'center' } } }
          merges.push({ s: { r: 1, c: startCol }, e: { r: 1, c: startCol + 1 } })

          const block = interp.data?.[0] || {}
          const bxs = Array.isArray(block.x) ? block.x : []
          const bys = Array.isArray(block.y) ? block.y : []
          bxs.forEach((xv, j) => {
            const r = dataStart + j + 1
            ws[`${colX}${r}`] = { v: xv }
            ws[`${colY}${r}`] = { v: bys[j] !== undefined ? bys[j] : '' }
          })
        })

        ws['!merges'] = merges
        const lastCol = 6 + interps.length * 3 - 2
        const lastRow = Math.max(
          dataStart + xs.length - 1,
          dataStart + 1 + Math.max(0, ...interps.map(i => i.data?.[0]?.x?.length || 0))
        )
        ws['!ref'] = `A1:${XLSX.utils.encode_col(lastCol)}${lastRow}`

        const cols = [
          { wch: 12 }, { wch: 12 }, { wch: 2 },
          { wch: 18 }, { wch: 15 }, { wch: 2 },
          ...interps.flatMap(() => [{ wch: 20 }, { wch: 20 }, { wch: 2 }])
        ]
        ws['!cols'] = cols

        XLSX.utils.book_append_sheet(wb, ws, 'Dataset')
        XLSX.writeFile(wb, `${baseName}.xlsx`)
      }
    })

    onClose()
  }

  return (
    <Box>
      <FormControl fullWidth margin="normal">
        <InputLabel id="dataset-multi-label">Datasets</InputLabel>
        <Select
          labelId="dataset-multi-label"
          multiple
          value={selectedKeys}
          onChange={handleChange}
          renderValue={(selected) => selected.join(', ')}
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
        <InputLabel id="format-label">File format</InputLabel>
        <Select
          labelId="format-label"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        >
          <MenuItem value="json">JSON</MenuItem>
          <MenuItem value="excel">Excel</MenuItem>
        </Select>
      </FormControl>

      <Button
        onClick={handleSave}
        color="primary"
        variant="contained"
        fullWidth
      >
        Save
      </Button>
    </Box>
  )
}