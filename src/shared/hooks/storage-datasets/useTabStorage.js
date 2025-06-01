import { useState } from 'react'
import { useDatasetsContext, useArduinoContext } from '../../contexts'
import { useDeleteDialog } from '../../components'

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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState({ datasetIndex: null, interpolationIndex: null })

  const { openDialog, index, open, close } = useDeleteDialog()

  const [importExportDialogOpen, setImportExportDialogOpen] = useState(false)
  const [importExportType, setImportExportType] = useState(0)
  const [importExportDefaultIndex, setImportExportDefaultIndex] = useState(null)

  const [datasetTab, setDatasetTab] = useState(0)
  const datasetTypes = ['CVW', 'EIS']

  const [lineEditorOpen, setLineEditorOpen] = useState(false)
  const [lineEditorIndex, setLineEditorIndex] = useState(null)

  const [lineEditorInitial, setLineEditorInitial] = useState({})

  const handleDelete = () => {
    if (index !== null) handleDeleteDataset(index)
    close()
  }

  const handleOpenTabFilter = (index) => {
    handleSetDatasetSelected(index)
    setTabIndex(1)
    showOnlyDataset(index)
  }

  const openDeleteDialog = (datasetIndex, interpolationIndex) => {
    setDeleteTarget({ datasetIndex, interpolationIndex })
    setDeleteDialogOpen(true)
  }

  const handleDeleteInterpolation = () => {
    const { datasetIndex, interpolationIndex } = deleteTarget
    if (datasetIndex !== null && interpolationIndex !== null) {
      const updatedDatasets = [...datasets]
      updatedDatasets[datasetIndex].interpolations.splice(interpolationIndex, 1)
      handleSetDataset(updatedDatasets)
      setDeleteDialogOpen(false)
    }
  }

  const handleToggleInterpolationVisibility = (datasetIndex, interpolationIndex) => {
    const updatedDatasets = [...datasets]
    const interpolation = updatedDatasets[datasetIndex].interpolations[interpolationIndex]
    interpolation.isVisible = !interpolation.isVisible
    handleSetDataset(updatedDatasets)
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
    const updatedDatasets = [...datasets]
    if (!updatedDatasets[lineEditorIndex].data[0].line)
      updatedDatasets[lineEditorIndex].data[0].line = {}
    updatedDatasets[lineEditorIndex].data[0].line.color = lineConfig.color
    updatedDatasets[lineEditorIndex].data[0].line.dash = lineConfig.dash
    updatedDatasets[lineEditorIndex].data[0].line.width = lineConfig.width
    updatedDatasets[lineEditorIndex].data[0].mode = 'lines'
    handleSetDataset(updatedDatasets)
    closeLineEditor()
  }

  const filteredDatasets = datasets.filter(ds => ds.type === datasetTypes[datasetTab])

  return {
    datasets, datasetSelected,
    isReading,
    datasetTab, setDatasetTab,  
    
    openDialog, close, handleDelete,
    deleteDialogOpen, setDeleteDialogOpen, handleDeleteInterpolation,
    importExportDialogOpen, setImportExportDialogOpen, importExportType,
    openLineEditor, closeLineEditor, handleChangeLine,
  
    importExportDefaultIndex,
    filteredDatasets,
    
    openDeleteDialog,
    handleToggleInterpolationVisibility,
    handleOpenImportExportDialog,  
    lineEditorOpen,
    lineEditorInitial,

    toggleDatasetVisibility,
    handleOpenExportDialogWithIndex,
    open,
    handleOpenTabFilter,
  }
}
