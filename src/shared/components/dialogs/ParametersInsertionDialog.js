import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from '@mui/material'

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
      <DialogTitle>Adicionar Novo Parâmetro</DialogTitle>
      <DialogContent>
        <TextField
          label="Nome do Parâmetro"
          value={paramName}
          onChange={(e) => setParamName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Valor do Parâmetro"
          value={paramValue}
          onChange={(e) => setParamValue(e.target.value)}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button
          onClick={handleAdd}
          onBlur={() => setParamName('')}
          color="primary"
          variant="contained"
          disabled={!paramName || !paramValue}
        >
          Adicionar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
