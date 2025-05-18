import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Tabs,
  Tab,
  Box,
  Button,
} from '@mui/material'
import ImportIcon from '@mui/icons-material/CloudUpload'
import ExportIcon from '@mui/icons-material/CloudDownload'
import { ImportDataset } from '..'
import { ExportDataset } from '..'

/**
 * Renders a dialog interface for importing or exporting a dataset
 *
 * @param {boolean} open             - Indicates whether the dialog is open
 * @param {() => void} onClose       - Callback to close the dialog
 * @param {number} [type=0]          - Initial selected tab index (0 for import, 1 for export)
 * @param {number} [defaultIndex]    - Default dataset index to use during export
 *
 * @returns {JSX.Element}
 */
export const ImportExportDialog = ({
  open,
  onClose,
  type = 0,
  defaultIndex,
}) => {

  const [tabIndex, setTabIndex] = useState(type)

  useEffect(() => {
    if (open) {
      setTabIndex(type)
    }
  }, [open, type])

  useEffect(() => {
    const root = document.querySelector("#root")
    if (open) {
      root?.setAttribute("inert", "true")
    } else {
      root?.removeAttribute("inert")
    }
    return () => {
      root?.removeAttribute("inert")
    }
  }, [open])

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Import / Export Dataset</DialogTitle>

      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab icon={<ImportIcon />} label="Import" />
        <Tab icon={<ExportIcon />} label="Export" />
      </Tabs>

      <DialogContent>
        <Box hidden={tabIndex !== 0}>
          <ImportDataset onClose={onClose} />
        </Box>
        <Box hidden={tabIndex !== 1}>
          <ExportDataset onClose={onClose} defaultIndex={defaultIndex} />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}