import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  IconButton,
  Stack,
  Typography,
  Box
} from '@mui/material'

import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import { DeleteDialog } from '..'

/**
 * Displays a dialog that allows the user to insert a new parameter with a name and value
 *
 * @param {(name: string, value: string) => void} onCreate  // criar novo
 * @param {(name: string, value: string) => void} onEdit    // editar existente
 * @param {(name: string) => void} onDelete                 // deletar existente
 * @param {Object.<string, string>} parameters              // parâmetros atuais (usado para listar e editar)
 *
 * @returns {JSX.Element}
 */
export const ParametersInsertionDialog = ({
  open,
  onClose,
  onCreate,
  onEdit,
  onDelete,
  parameters = {},
}) => {
  const [paramName, setParamName] = useState('')
  const [paramValue, setParamValue] = useState('')
  const [editing, setEditing] = useState(false)
  const [originalName, setOriginalName] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [paramToDelete, setParamToDelete] = useState(null)

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

  const handleSubmit = () => {
    if (!paramName || !paramValue) return
    if (editing) {
      onEdit(paramName, paramValue)
    } else {
      onCreate(paramName, paramValue)
    }
    clearForm()
    onClose()
  }

  const handleEditClick = (name, value) => {
    setParamName(name)
    setParamValue(value)
    setOriginalName(name)
    setEditing(true)
  }

  const openDeleteDialog = (name) => {
    setParamToDelete(name)
    setDeleteDialogOpen(true)
  }

  const handleDelete = () => {
    if (paramToDelete) {
      onDelete(paramToDelete)
    }
    setDeleteDialogOpen(false)
    setParamToDelete(null)
  }

  const clearForm = () => {
    setParamName('')
    setParamValue('')
    setEditing(false)
    setOriginalName('')
  }

  const handleCancel = () => {
    clearForm()
    onClose()
  }

  return (
    <>
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={handleDelete}
      />

      <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editing ? 'Edit Parameter' : 'Manage Parameters'}
        </DialogTitle>

        <DialogContent>
          <TextField
            label="Parameter Name"
            value={paramName}
            onChange={(e) => setParamName(e.target.value)}
            fullWidth
            margin="normal"
            disabled={editing} // disable name during editing
          />
          <TextField
            label="Parameter Value"
            value={paramValue}
            onChange={(e) => setParamValue(e.target.value)}
            fullWidth
            margin="normal"
          />

          <Box mt={3}>
            <Typography variant="subtitle2" gutterBottom>
              Created Parameters
            </Typography>

            {Object.keys(parameters).length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                fontStyle="italic"
              >
                No parameter has been created yet.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {Object.entries(parameters).map(([name, value]) => (
                  <Box
                    key={name}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid #ddd',
                      borderRadius: 1,
                      px: 2,
                      py: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {value}
                      </Typography>
                    </Box>

                    <Box>
                      <IconButton
                        onClick={() => handleEditClick(name, value)}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => openDeleteDialog(name)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCancel} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={!paramName || !paramValue}
          >
            {editing ? 'Save Changes' : 'Add Parameter'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
