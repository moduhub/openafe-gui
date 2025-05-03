import { useState, useEffect } from "react"

import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Button 
} from "@mui/material"

export const DeleteDialog = ({ open, onClose, onDelete }) => {
  
  // Gerencia o atributo inert no root para acessibilidade
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

  const handleConfirmDelete = () => {
    onDelete()
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirmar exclusão</DialogTitle>
      <DialogContent>
        <p>Você tem certeza de que deseja excluir este item?</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleConfirmDelete} color="primary" variant="contained">
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export const useDeleteDialog = () => {
  const [openDialog, setOpenDialog] = useState(false)
  const [index, setIndex] = useState(null)

  const open = (i) => {
    setIndex(i)
    setOpenDialog(true)
  }

  const close = () => {
    setOpenDialog(false)
    setIndex(null)
  }

  return { openDialog, index, open, close }
}
