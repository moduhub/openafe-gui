import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormControl, InputLabel, Select, MenuItem,
  FormGroup, FormControlLabel, Checkbox, Switch
} from '@mui/material'
import { useState, useEffect } from 'react'

export const DatasetSelectorDialog = ({
  open, onClose, onSelect, datasetTypes,
  filterType, setFilterType,
  showOnlyVisible, setShowOnlyVisible,
  showOnlyHidden, setShowOnlyHidden,
  hasPointMarkers, setHasPointMarkers,
  hasAreaMarkers, setHasAreaMarkers,
  hasInterpolations, setHasInterpolations
}) => {
  const [tempFilterType, setTempFilterType] = useState(filterType || 'ALL')
  const [tempShowOnlyVisible, setTempShowOnlyVisible] = useState(showOnlyVisible)
  const [tempShowOnlyHidden, setTempShowOnlyHidden] = useState(showOnlyHidden)
  const [tempHasPointMarkers, setTempHasPointMarkers] = useState(hasPointMarkers)
  const [tempHasAreaMarkers, setTempHasAreaMarkers] = useState(hasAreaMarkers)
  const [tempHasInterpolations, setTempHasInterpolations] = useState(hasInterpolations)

  // Update the temporary files whenever the dialog opens.
  useEffect(() => {
    if (open) {
      setTempFilterType(filterType || 'ALL')
      setTempShowOnlyVisible(showOnlyVisible)
      setTempShowOnlyHidden(showOnlyHidden)
      setTempHasPointMarkers(hasPointMarkers)
      setTempHasAreaMarkers(hasAreaMarkers)
      setTempHasInterpolations(hasInterpolations)
    }
  }, [open])

  const handleConfirm = () => {
    setFilterType(tempFilterType)
    setShowOnlyVisible(tempShowOnlyVisible)
    setShowOnlyHidden(tempShowOnlyHidden)
    setHasPointMarkers(tempHasPointMarkers)
    setHasAreaMarkers(tempHasAreaMarkers)
    setHasInterpolations(tempHasInterpolations)

    onSelect?.(tempFilterType) // compatibility with previous call
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Sort Datasets By</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel id="dataset-type-label">Type</InputLabel>
          <Select
            labelId="dataset-type-label"
            value={tempFilterType}
            label="Tipo"
            onChange={(e) => setTempFilterType(e.target.value)}
          >
            <MenuItem value="ALL">All</MenuItem>
            {datasetTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormGroup row>
          <FormControlLabel
            control={
              <Switch
                checked={tempShowOnlyVisible}
                onChange={(e) => {
                  const checked = e.target.checked
                  setTempShowOnlyVisible(checked)
                  if (checked) setTempShowOnlyHidden(false)
                }}
              />
            }
            label="Only visible"
          />
          <FormControlLabel
            control={
              <Switch
                checked={tempShowOnlyHidden}
                onChange={(e) => {
                  const checked = e.target.checked
                  setTempShowOnlyHidden(checked)
                  if (checked) setTempShowOnlyVisible(false)
                }}
              />
            }
            label="Only hidden"
          />
        </FormGroup>

        <FormGroup column="true">
          <FormControlLabel
            control={
              <Checkbox
                checked={tempHasPointMarkers}
                onChange={(e) => setTempHasPointMarkers(e.target.checked)}
              />
            }
            label="With point markers"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={tempHasAreaMarkers}
                onChange={(e) => setTempHasAreaMarkers(e.target.checked)}
              />
            }
            label="With area markers"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={tempHasInterpolations}
                onChange={(e) => setTempHasInterpolations(e.target.checked)}
              />
            }
            label="With interpolations"
          />
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained">Apply sorting</Button>
      </DialogActions>
    </Dialog>
  )
}
