import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from '@mui/material'

/**
 * Displays a dialog that allows the user to insert a new parameter with a name and value
 *
 * @param {boolean} open                                - Whether the dialog is currently visible
 * @param {() => void} onClose                          - Callback to close the dialog
 * @param {(name: string, value: string) => void} onAdd - Callback invoked when a new parameter is added
 *
 * @returns {JSX.Element}
 */
export const ParametersInsertionDialog = ({ open, onClose, onAdd }) => {
  const [paramName, setParamName] = useState('')
  const [paramValue, setParamValue] = useState('')

  useEffect(() => {
    const rootElement = document.querySelector('#root')
    if (open) {
      rootElement?.setAttribute('inert', 'true')
    } else {
      rootElement?.removeAttribute('inert')
    }
    return () => {
      rootElement?.removeAttribute('inert')
    }
  }, [open])

  const handleAdd = () => {
    if (paramName && paramValue) {
      onAdd(paramName, paramValue)
      setParamName('')
      setParamValue('')
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Parameter</DialogTitle>
      <DialogContent>
        <TextField
          label="Parameter Name"
          value={paramName}
          onChange={(e) => setParamName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Value of the Parameter"
          value={paramValue}
          onChange={(e) => setParamValue(e.target.value)}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleAdd}
          onBlur={() => setParamName('')}
          color="primary"
          variant="contained"
          disabled={!paramName || !paramValue}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  )
}