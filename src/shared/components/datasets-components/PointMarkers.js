import { useState } from 'react'
import { Box, Typography, Chip, Stack, Accordion, AccordionSummary, AccordionDetails, Button } from '@mui/material'
import { Circle, Square, Star, Add, ChangeHistory } from '@mui/icons-material'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'

import { useDatasetsContext } from '../../contexts'
import { DeleteDialog, MarkerEditorDialog } from '..'

/**
 * PointMarkers displays the list of saved points markers for a dataset
 *
 * @param {Object[]} points - Array of points [{ value, start, end }]
 */
export const PointMarkers = ({ points, datasetIndex }) => {

  const { datasets, handleSetDataset } = useDatasetsContext()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTargetIndex, setDeleteTargetIndex] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editTargetIndex, setEditTargetIndex] = useState(null)

  if (!points || points.length === 0) return null

  const getSymbom = (name, color_) => {
    switch (name) {
      case "circle":
        return <Circle sx={{ color: color_, minWidth: 32 }}/>
        break
      case "square":
        return <Square sx={{ color: color_, minWidth: 32 }}/>
        break
      case "star":
        return <Star sx={{ color: color_, minWidth: 32 }}/>
        break
      case "cross":
        return <Add sx={{ color: color_, minWidth: 32 }}/>
        break
      case "triangle-up":
        return <ChangeHistory sx={{ color: color_, minWidth: 32 }}/>
        break
      default:
        break
    }
  }

  const onToggleVisibility = (i) => {
    const updatedDatasets = [...datasets]
    const marker = updatedDatasets[datasetIndex].markers[i]
    marker.isVisible = !marker.isVisible
    handleSetDataset(updatedDatasets) 
  }

  const openDeleteDialog = (i) => {
    setDeleteTargetIndex(i)
    setDeleteDialogOpen(true)
  }

  const handleDeleteMarker = () => {
    if (deleteTargetIndex !== null) {
      const updatedDatasets = [...datasets]
      updatedDatasets[datasetIndex].markers.splice(deleteTargetIndex, 1)
      handleSetDataset(updatedDatasets)
      setDeleteDialogOpen(false)
      setDeleteTargetIndex(null)
    }
  }

  const openEditDialog = (i) => {
    setEditTargetIndex(i)
    setEditDialogOpen(true)
  }

  const handleEditMarker = (newProps) => {
    if (editTargetIndex !== null) {
      const updatedDatasets = [...datasets]
      updatedDatasets[datasetIndex].markers[editTargetIndex] = {
        ...updatedDatasets[datasetIndex].markers[editTargetIndex],
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
      onDelete={handleDeleteMarker}
    />
    <MarkerEditorDialog
      open={editDialogOpen}
      onClose={() => setEditDialogOpen(false)}
      initialMarker={editTargetIndex !== null ? points[editTargetIndex] : null}
      onSave={handleEditMarker}
    />

    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />}>
        <Typography variant="body1" noWrap size="small">
          Markers
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1}>
          {points.map((point, idx) => (
            <Box key={idx} display="flex" flexDirection="column" gap={0.5}>
              <Box display="flex" alignItems="center" gap={2}>
                <Chip label={`${point.label}`} size="small"/>
                { getSymbom(point.symbol, point.color) }
              </Box>
              <Box display="flex" alignItems="center" width="100%">
                <Button
                  onClick={() => onToggleVisibility(idx)}
                  size="small"
                  startIcon={
                    point.isVisible ? <VisibilityOffIcon /> : <VisibilityIcon />
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
              <Typography variant='caption'>Point: [{point.x}; {point.y}]</Typography>
            </Box>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
    </>
  )
}