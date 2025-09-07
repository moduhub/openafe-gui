import { Box, Typography, Chip, Stack, Accordion, AccordionSummary, AccordionDetails, Button } from '@mui/material'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'

import { useState } from 'react'
import { useDatasetsContext } from '../../contexts'
import { DeleteDialog, AreaEditorDialog } from '..'

/**
 * @brief AreaMarkers displays the list of saved areas for a dataset
 *
 * @param {Object[]} areas - Array of areas [{ value, start, end }]
 * @param {number} datasetIndex - Index of the dataset
 * 
 * Behavior:
 * - Allows toggling visibility, editing, and deleting markers.
 * - Uses AreaEditorDialog for editing area properties.
 * - Uses DeleteDialog for confirming area deletion.
 */
export const AreaMarkers = ({ areas, datasetIndex }) => {
  const { datasets, handleSetDataset } = useDatasetsContext()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTargetIndex, setDeleteTargetIndex] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editTargetIndex, setEditTargetIndex] = useState(null)


  if (!areas || areas.length === 0) return null

  const onToggleVisibility = (i) => {
    const updatedDatasets = [...datasets]
    const area = updatedDatasets[datasetIndex].areas[i]
    area.isVisible = !area.isVisible
    handleSetDataset(updatedDatasets)
  }

  const openDeleteDialog = (i) => {
    setDeleteTargetIndex(i)
    setDeleteDialogOpen(true)
  }

  const handleDeleteArea = () => {
    if (deleteTargetIndex !== null) {
      const updatedDatasets = [...datasets]
      updatedDatasets[datasetIndex].areas.splice(deleteTargetIndex, 1)
      handleSetDataset(updatedDatasets)
      setDeleteDialogOpen(false)
      setDeleteTargetIndex(null)
    }
  }

  const openEditDialog = (i) => {
    setEditTargetIndex(i)
    setEditDialogOpen(true)
  }

  const handleEditArea = (newProps) => {
    if (editTargetIndex !== null) {
      const updatedDatasets = [...datasets]
      updatedDatasets[datasetIndex].areas[editTargetIndex] = {
        ...updatedDatasets[datasetIndex].areas[editTargetIndex],
        ...newProps
      }
      handleSetDataset(updatedDatasets)
      setEditDialogOpen(false)
      setEditTargetIndex(null)
    }
  }

  return (
    <>
    <DeleteDialog
      open={deleteDialogOpen}
      onClose={() => setDeleteDialogOpen(false)}
      onDelete={handleDeleteArea}
    />
    <AreaEditorDialog
      open={editDialogOpen}
      onClose={() => setEditDialogOpen(false)}
      initialArea={editTargetIndex !== null ? areas[editTargetIndex] : null}
      onSave={handleEditArea}
    />

    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />}>
        <Typography variant="body1" noWrap size="small">
          Areas
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1}>
          {areas.map((area, idx) => (
            <Box key={idx} display="flex" flexDirection="column" gap={0.5}>
              <Box display="flex" alignItems="center" gap={2}>
                <Chip label={area.label ? area.label : `#${idx + 1} Area`} size="small" />
              </Box>
              <Box display="flex" alignItems="center" width="100%">
                <Button
                  onClick={() => onToggleVisibility(idx)}
                  size="small"
                  startIcon={
                    area.isVisible ? <VisibilityOffIcon /> : <VisibilityIcon />
                  }
                ></Button>
                <Button
                  onClick={() => openEditDialog(idx)}
                  size="small"
                  startIcon={<EditIcon />}
                />
                <Button
                  onClick={() => openDeleteDialog(idx)}
                  size="small"
                  startIcon={<DeleteIcon />}
                ></Button>
              </Box>
              <Typography variant="body2">
                  Value: <b>{area.value?.toExponential?.(3) ?? area.value}</b> [V·A]
                </Typography>
              <Typography variant="caption" color="text.secondary">
                (from {area.start} to {area.end})
              </Typography>
            </Box>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
    </>
  )
}