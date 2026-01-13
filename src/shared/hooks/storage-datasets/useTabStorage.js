import { useState } from 'react'
import { useDatasetsContext, useArduinoContext } from '../../contexts'
import { useDeleteDialog } from '../../components'

/**
 * @brief Hook that centralizes tab and dialog state for dataset storage UI.
 *
 * @param {(index:number) => void} setTabIndex - Setter to switch the application tab index.
 * @returns {object} An object exposing datasets, UI state flags, and action handlers used by the storage tab:
 *   - datasets, datasetSelected, isReading
 *   - toggleDatasetVisibility, handleOpenTabFilter, handleOpenExportDialogWithIndex, handleOpenImportExportDialog
 *   - openDialog, close, handleDelete, deleteDialogOpen, setDeleteDialogOpen, handleDeleteInterpolation, openDeleteDialog
 *   - importExportDialogOpen, setImportExportDialogOpen, importExportType, importExportDefaultIndex
 *   - interpolationLineEditorOpen, interpolationLineEditorInitial, openInterpolationLineEditor
 *   - datasetSelectorOpen, handleOpenDatasetSelector, handleCloseDatasetSelector
 *   - datasetTypes, handleDatasetSelected, filterType, setFilterType
 *   - showOnlyVisible, setShowOnlyVisible, showOnlyHidden, setShowOnlyHidden
 *   - hasPointMarkers, setHasPointMarkers, hasAreaMarkers, setHasAreaMarkers
 *   - hasInterpolations, setHasInterpolations
 *   - openLineEditor, closeLineEditor, handleChangeLine, lineEditorOpen, lineEditorInitial
 *   - closeInterpolationLineEditor, handleChangeInterpolationLine
 *   - filteredDatasets
 *   - open (alias from useDeleteDialog)
 *   - handleToggleInterpolationVisibility
 *
 * Behavior:
 * - Manages many UI state booleans for dialogs/editors and temporary targets.
 * - Provides helper functions to open editors, apply line changes, delete interpolations, filter datasets and return filtered list.
 * - Integrates with datasets/dash contexts (useDatasetsContext, useArduinoContext) and the reusable delete dialog hook.
 */
export const useTabStorage = (setTabIndex) => {
  const {
    handleDeleteDataset,
    handleSetDatasetSelected,
    datasets,
    handleSetDataset,
    toggleDatasetVisibility,
    showOnlyDataset,
    datasetSelected,
    experimentType
  } = useDatasetsContext()

  const { isReading } = useArduinoContext()

  const { openDialog, index, open, close } = useDeleteDialog()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState({ datasetIndex: null, interpolationIndex: null })

  const [importExportDialogOpen, setImportExportDialogOpen] = useState(false)
  const [importExportType, setImportExportType] = useState(0)
  const [importExportDefaultIndex, setImportExportDefaultIndex] = useState(null)

  const [lineEditorOpen, setLineEditorOpen] = useState(false)
  const [lineEditorIndex, setLineEditorIndex] = useState(null)
  const [lineEditorInitial, setLineEditorInitial] = useState({})

  const [datasetSelectorOpen, setDatasetSelectorOpen] = useState(false)

  const datasetTypes = ['CVW', 'DPV', 'SWV', 'EIS']
  const [filterType, setFilterType] = useState('ALL')
  const [showOnlyVisible, setShowOnlyVisible] = useState(false)
  const [showOnlyHidden, setShowOnlyHidden] = useState(false)
  const [hasPointMarkers, setHasPointMarkers] = useState(false)
  const [hasAreaMarkers, setHasAreaMarkers] = useState(false)
  const [hasInterpolations, setHasInterpolations] = useState(false)

  const [interpolationLineEditorOpen, setInterpolationLineEditorOpen] = useState(false)
  const [interpolationLineEditorTarget, setInterpolationLineEditorTarget] = useState({ datasetIndex: null, interpolationIndex: null })
  const [interpolationLineEditorInitial, setInterpolationLineEditorInitial] = useState({})


  const handleDelete = () => {
    if (index !== null) handleDeleteDataset(index)
    close()
  }

  const openDeleteDialog = (datasetIndex, interpolationIndex) => {
    setDeleteTarget({ datasetIndex, interpolationIndex })
    setDeleteDialogOpen(true)
  }

  const handleDeleteInterpolation = () => {
    const { datasetIndex, interpolationIndex } = deleteTarget
    if (datasetIndex !== null && interpolationIndex !== null) {
      const updated = [...datasets]
      updated[datasetIndex].interpolations.splice(interpolationIndex, 1)
      handleSetDataset(updated)
      setDeleteDialogOpen(false)
    }
  }

  const handleToggleInterpolationVisibility = (datasetIndex, interpolationIndex) => {
    const updated = [...datasets]
    const interpolation = updated[datasetIndex].interpolations[interpolationIndex]
    interpolation.isVisible = !interpolation.isVisible
    handleSetDataset(updated)
  }

  const handleOpenImportExportDialog = () => {
    setImportExportType(0)
    setImportExportDefaultIndex(null)
    setImportExportDialogOpen(true)
  }

  const handleOpenExportDialogWithIndex = (index) => {
    setImportExportType(1)
    setImportExportDefaultIndex(index)
    setImportExportDialogOpen(true)
  }

  const openLineEditor = (index) => {
    setLineEditorIndex(index)
    setLineEditorInitial(datasets[index]?.data?.[0]?.line || {})
    setLineEditorOpen(true)
  }

  const closeLineEditor = () => {
    setLineEditorOpen(false)
    setLineEditorIndex(null)
    setLineEditorInitial({})
  }

  const handleChangeLine = (lineConfig) => {
    if (lineEditorIndex === null) return
    const updated = [...datasets]
    if (!updated[lineEditorIndex].data[0].line)
      updated[lineEditorIndex].data[0].line = {}
    updated[lineEditorIndex].data[0].line.color = lineConfig.color
    updated[lineEditorIndex].data[0].line.dash = lineConfig.dash
    updated[lineEditorIndex].data[0].line.width = lineConfig.width
    updated[lineEditorIndex].data[0].mode = 'lines'
    handleSetDataset(updated)
    closeLineEditor()
  }

  const handleOpenDatasetSelector = () => {
    setDatasetSelectorOpen(true)
  }

  const handleCloseDatasetSelector = () => {
    setDatasetSelectorOpen(false)
  }

  const handleDatasetSelected = (type) => {
    setFilterType(type)
  }

  const handleOpenTabFilter = (index) => {
    handleSetDatasetSelected(index)
    setTabIndex(1)
    showOnlyDataset(index)
  }

  const openInterpolationLineEditor = (datasetIndex, interpolationIndex) => {
    setInterpolationLineEditorTarget({ datasetIndex, interpolationIndex })
    setInterpolationLineEditorInitial(
      datasets[datasetIndex]?.interpolations?.[interpolationIndex]?.data?.[0]?.line || {}
    )
    setInterpolationLineEditorOpen(true)
  }

  const closeInterpolationLineEditor = () => {
    setInterpolationLineEditorOpen(false)
    setInterpolationLineEditorTarget({ datasetIndex: null, interpolationIndex: null })
    setInterpolationLineEditorInitial({})
  }

  const handleChangeInterpolationLine = (lineConfig) => {
    const { datasetIndex, interpolationIndex } = interpolationLineEditorTarget
    if (datasetIndex === null || interpolationIndex === null) return
    const updated = [...datasets]
    const interpolation = updated[datasetIndex].interpolations[interpolationIndex]
    if (!interpolation.data[0].line)
      interpolation.data[0].line = {}
    interpolation.data[0].line.color = lineConfig.color
    interpolation.data[0].line.dash = lineConfig.dash
    interpolation.data[0].line.width = lineConfig.width
    handleSetDataset(updated)
    closeInterpolationLineEditor()
  }

  const filteredDatasets = datasets.filter(ds => {
    const matchType = filterType === 'ALL' || ds.type === filterType
    const matchVisibility = (!showOnlyVisible || ds.visible) && (!showOnlyHidden || !ds.visible)
    const matchMarkers = !hasPointMarkers || (ds.markers && ds.markers.length > 0)
    const matchAreas = !hasAreaMarkers || (ds.areas && ds.areas.length > 0)
    const matchInterpolations = !hasInterpolations || (ds.interpolations && ds.interpolations.length > 0)

    return matchType && matchVisibility && matchMarkers && matchAreas && matchInterpolations
  })

  return {
    datasets, datasetSelected, isReading,

    // Dataset Actions
    toggleDatasetVisibility,
    handleOpenTabFilter,
    handleOpenExportDialogWithIndex,
    handleOpenImportExportDialog,

    // Dialogs
    openDialog, close, handleDelete,
    deleteDialogOpen, setDeleteDialogOpen, handleDeleteInterpolation,
    openDeleteDialog,
    importExportDialogOpen, setImportExportDialogOpen, importExportType, importExportDefaultIndex,
    interpolationLineEditorOpen, interpolationLineEditorInitial, openInterpolationLineEditor,

    // Sorts
    datasetSelectorOpen, handleOpenDatasetSelector, handleCloseDatasetSelector,
    datasetTypes, handleDatasetSelected,
    filterType, setFilterType,
    showOnlyVisible, setShowOnlyVisible,
    showOnlyHidden, setShowOnlyHidden,
    hasPointMarkers, setHasPointMarkers,
    hasAreaMarkers, setHasAreaMarkers,
    hasInterpolations, setHasInterpolations,

    // Line Editor
    openLineEditor, closeLineEditor, handleChangeLine,
    lineEditorOpen, lineEditorInitial,
    closeInterpolationLineEditor, handleChangeInterpolationLine,

    // Sorted datasets
    filteredDatasets,
    
    // Access to reusable dialog
    open,

    handleToggleInterpolationVisibility,
  }
}
