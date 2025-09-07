import {
  Box,
  Accordion, AccordionSummary, AccordionDetails,
  Button,
  useTheme,
  Typography,
} from '@mui/material'

import RecordingIcon from '@mui/icons-material/FiberManualRecord'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import SaveAltIcon from '@mui/icons-material/SaveAlt'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import StartIcon from '@mui/icons-material/Start'
import SettingsIcon from '@mui/icons-material/Settings'
import ImportExportIcon from '@mui/icons-material/ImportExport'

import { useTabStorage } from '../../hooks'

import {
  DeleteDialog,
  InterpolationComponent,
  ParametersComponent,
  PointsComponent,
  AreaMarkers,
  PointMarkers,
  ImportExportDialog,
  LineEditorDialog,
  DatasetSelectorDialog,
} from '..'

/**
 * @brief TabStorage component provides a UI panel for managing datasets in storage
 * 
 * @param {()=>{void}} setTabIndex - Function to switch tabs in the parent component 
 * 
 * Behavior:
 * - Displays a list of datasets with options to view, edit, export, delete, and filter them.
 * - Integrates multiple dialogs for dataset operations (delete confirmation, import/export, line editing, dataset selection).
 * - Uses context hooks to manage dataset state and actions.
 */
export const TabStorage = ({ setTabIndex }) => {
  const theme = useTheme()

  const {
    datasets, datasetSelected,
    isReading,

    openDialog, close, handleDelete,
    deleteDialogOpen, setDeleteDialogOpen, handleDeleteInterpolation,
    importExportDialogOpen, setImportExportDialogOpen, importExportType,
    datasetSelectorOpen, handleOpenDatasetSelector, handleCloseDatasetSelector,
    interpolationLineEditorOpen, interpolationLineEditorInitial, openInterpolationLineEditor,

    datasetTypes, handleDatasetSelected,
    filterType, setFilterType,
    showOnlyVisible, setShowOnlyVisible,
    showOnlyHidden, setShowOnlyHidden,
    hasPointMarkers, setHasPointMarkers,
    hasAreaMarkers, setHasAreaMarkers,
    hasInterpolations, setHasInterpolations,

    openLineEditor, closeLineEditor, handleChangeLine,
    lineEditorOpen,
    lineEditorInitial,
    closeInterpolationLineEditor, handleChangeInterpolationLine,

    importExportDefaultIndex,
    filteredDatasets,

    openDeleteDialog,
    handleToggleInterpolationVisibility,
    handleOpenImportExportDialog,

    toggleDatasetVisibility,
    handleOpenExportDialogWithIndex,
    open,
    handleOpenTabFilter,
  } = useTabStorage(setTabIndex)

  return (
    <>
      <DeleteDialog open={openDialog} onClose={close} onDelete={handleDelete} />
      <DeleteDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onDelete={handleDeleteInterpolation} />
      <ImportExportDialog open={importExportDialogOpen} onClose={() => setImportExportDialogOpen(false)} type={importExportType} defaultIndex={importExportDefaultIndex} />
      <LineEditorDialog open={lineEditorOpen} onClose={closeLineEditor} initialLine={lineEditorInitial} onSave={handleChangeLine} />
      <LineEditorDialog open={interpolationLineEditorOpen} onClose={closeInterpolationLineEditor} initialLine={interpolationLineEditorInitial} onSave={handleChangeInterpolationLine} />
      <DatasetSelectorDialog
        open={datasetSelectorOpen} onClose={handleCloseDatasetSelector}
        onSelect={handleDatasetSelected}
        datasetTypes={datasetTypes}
        filterType={filterType} setFilterType={setFilterType}
        showOnlyVisible={showOnlyVisible} setShowOnlyVisible={setShowOnlyVisible}
        showOnlyHidden={showOnlyHidden} setShowOnlyHidden={setShowOnlyHidden}
        hasPointMarkers={hasPointMarkers} setHasPointMarkers={setHasPointMarkers}
        hasAreaMarkers={hasAreaMarkers} setHasAreaMarkers={setHasAreaMarkers}
        hasInterpolations={hasInterpolations} setHasInterpolations={setHasInterpolations}
      />

      <Box
        sx={{
          height: 440, width: 248,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >

        <Box sx={{ mb: 1, mt:2 }}>
          <Button
            onClick={() => handleOpenImportExportDialog()}
            variant="contained"
            color="primary"
            startIcon={<ImportExportIcon />}
            fullWidth
          >
            Import / Export
          </Button>
        </Box>

        <Box sx={{ mb: 2}}>
          <Button
            onClick={handleOpenDatasetSelector}
            variant="outlined"
            startIcon={<SettingsIcon />}
            fullWidth
          >
            Sort by
          </Button>
        </Box>

        {filteredDatasets.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            align="center"
            sx={{ padding: theme.spacing(2), marginTop: theme.spacing(2) }}
          >
            There are no datasets in cache at the moment.
          </Typography>
        ) : (
          filteredDatasets.map((dataset, index) => {
            const originalIndex = datasets.findIndex(ds => ds === dataset)
            const isCurrentDataset = isReading && datasetSelected === originalIndex

            return (
              <Accordion key={originalIndex}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    color: dataset.visible ? 'inherit' : 'gray', px: 2,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', flexGrow: 1 }}>
                    <Typography variant="h6">
                      {dataset.name || `Dataset ${originalIndex + 1}`}
                    </Typography>
                    {isCurrentDataset && (
                      <RecordingIcon
                        fontSize="small"
                        sx={{
                          color: 'red',
                          ml: 1,
                          verticalAlign: 'middle',
                          lineHeight: 0,
                        }}
                      />
                    )}
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  <Box
                    width="100%"
                    display="flex"
                    marginBottom={1}
                    justifyContent="center"
                    overflow="hidden"
                  >
                    {[{
                      onClick: () => toggleDatasetVisibility(originalIndex),
                      icon: datasets[originalIndex].visible ? <VisibilityOffIcon /> : <VisibilityIcon />,
                      disabled: isReading
                    }, {
                      onClick: () => handleOpenExportDialogWithIndex(originalIndex),
                      icon: <SaveAltIcon />,
                      disabled: isReading
                    }, {
                      onClick: () => openLineEditor(originalIndex),
                      icon: <EditIcon />,
                      disabled: isReading
                    }, {
                      onClick: () => open(originalIndex),
                      icon: <DeleteIcon />,
                      disabled: isReading
                    }, {
                      onClick: () => handleOpenTabFilter(originalIndex),
                      icon: <StartIcon />,
                      disabled: isReading
                    }].map((btn, i) => (
                      <Button
                        key={i}
                        onClick={btn.onClick}
                        disabled={btn.disabled}
                        sx={{ minWidth: 'auto', justifyContent: 'space-between', width: '100%' }}
                      >
                        {btn.icon}
                      </Button>
                    ))}
                  </Box>

                  <ParametersComponent dataset={dataset} />
                  <PointsComponent dataset={dataset} />
                  <PointMarkers datasetIndex={originalIndex} points={dataset.markers} />
                  <AreaMarkers datasetIndex={originalIndex} areas={dataset.areas} />
                  <InterpolationComponent
                    dataset={dataset}
                    datasetIndex={originalIndex}
                    onToggleVisibility={handleToggleInterpolationVisibility}
                    onDeleteInterpolation={openDeleteDialog}
                    onEditInterpolationLine={openInterpolationLineEditor}
                  />
                </AccordionDetails>
              </Accordion>
            )
          })
        )}
      </Box>
    </>
  )
}
