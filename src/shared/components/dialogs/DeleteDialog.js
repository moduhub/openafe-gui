import { useState, useEffect } from "react"

import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Button 
} from "@mui/material"

/**
 * DeleteDialog displays a confirmation dialog for deleting an item
 * It manages accessibility by setting the root element inert while open
 *
 * @param {boolean} open        - Controls whether the dialog is open
 * @param {() => void} onClose  - Callback to close the dialog
 * @param {() => void} onDelete - Callback to confirm and perform the delete action
 */
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

/**
 * Custom hook to manage the state of a delete confirmation dialog
 *
 * @returns {{
 *   openDialog: boolean,        // Whether the dialog is currently open
 *   index: number | null,       // The index of the item to delete or null
 *   open: (i: number) => void,  // Function to open the dialog with an item index
 *   close: () => void           // Function to close the dialog and reset index
 * }}
 */
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