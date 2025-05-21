import { useState } from 'react'

import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  useTheme,
  Typography,
} from '@mui/material'

import RecordingIcon from '@mui/icons-material/FiberManualRecord'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import SaveAltIcon from '@mui/icons-material/SaveAlt'
import DeleteIcon from '@mui/icons-material/Delete'
import StartIcon from '@mui/icons-material/Start'

import ImportExportIcon from '@mui/icons-material/ImportExport';

import {
  useDatasetsContext,
  useArduinoContext
} from '../../contexts'

import {
  DeleteDialog, 
  useDeleteDialog,
  InterpolationComponent,
  ParametersComponent,
  PointsComponent,
  AreaMarkers,
  PointMarkers,
  ImportExportDialog
} from '..'

/**
 * TabStorage component displays a list of datasets with controls for managing them
 * 
 * Features:
 * - Import and export datasets
 * - Delete datasets or their interpolations
 * - Toggle visibility of datasets and interpolations
 * - Navigate to filter tab for a selected dataset
 * - Shows current reading dataset indicator
 * 
 * @param {function} setTabIndex - Function to change the active tab index
 * 
 * @returns {JSX.Element}
 */
export const TabStorage = ({ setTabIndex }) => {

  const theme = useTheme()
  const {
    handleDeleteDataset, 
    handleSetDatasetSelected,
    datasets, handleSetDataset,
    toggleDatasetVisibility,
    showOnlyDataset,
    datasetSelected
  } = useDatasetsContext()
  const {
    isReading
  } = useArduinoContext()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState({ datasetIndex: null, interpolationIndex: null })
  const { openDialog, index, open, close } = useDeleteDialog()
  const [importExportDialogOpen, setImportExportDialogOpen] = useState(false)
  const [importExportType, setImportExportType] = useState(0)
  const [importExportDefaultIndex, setImportExportDefaultIndex] = useState(null)

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
    setImportExportType(0) // type: import
    setImportExportDefaultIndex(null)
    setImportExportDialogOpen(true)
  }

  const handleOpenExportDialogWithIndex = (index) => {
    setImportExportType(1) // type: export
    setImportExportDefaultIndex(index)
    setImportExportDialogOpen(true)
  }
  
  return (
    <>
      <DeleteDialog
        open={openDialog}
        onClose={close}
        onDelete={handleDelete}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={handleDeleteInterpolation}
      />
      <ImportExportDialog
        open={importExportDialogOpen}
        onClose={() => setImportExportDialogOpen(false)}
        type={importExportType}
        defaultIndex={importExportDefaultIndex}
      />

      <Box
        sx={{
          height: 440, width: 248,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ mb: 2, mt: 2 }}>
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

        {datasets.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            align="center"
            sx={{
              padding: theme.spacing(2),
              marginTop: theme.spacing(2),
            }}
          >
            There are no datasets in cache at the moment.
          </Typography>
        ) : (
          datasets.map((dataset, index) => {

            const formatPoint = (val) => Number(val).toFixed(2)
            const xArray = dataset.data[0].x
            const yArray = dataset.data[0].y

            const isCurrentDataset = isReading && datasetSelected === index;

            return (  
              <Accordion key={index}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    color: dataset.visible ? 'inherit' : 'gray',
                    px: 2,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', flexGrow: 1 }}>
                    <Typography variant="h6">
                      {dataset.name || `Dataset ${index + 1}`}
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
                    {[
                      { 
                        onClick: () => toggleDatasetVisibility(index), 
                        icon: datasets[index].visible ? <VisibilityOffIcon /> : <VisibilityIcon />, 
                        disabled: isReading
                      },
                      { 
                        onClick: () => handleOpenExportDialogWithIndex(index),
                        icon: <SaveAltIcon />,
                        disabled: isReading
                      },                      
                      { 
                        onClick: () => open(index), 
                        icon: <DeleteIcon />,
                        disabled: isReading 
                      },
                      { 
                        onClick: () => handleOpenTabFilter(index), 
                        icon: <StartIcon />,
                        disabled: isReading
                      }
                    ].map((btn, i) => (
                    <Button
                      key={i}
                      onClick={btn.onClick}
                      disabled={btn.disabled}            
                      sx={{
                        minWidth: 'auto',
                        justifyContent: 'space-between',
                        width: '100%'
                      }}
                    >
                      {btn.icon}
                    </Button>
                    ))}
                  </Box>

                  <ParametersComponent 
                    dataset={dataset}
                  />

                  <PointsComponent
                    formatPoint={formatPoint}
                    xArray={xArray}
                    yArray={yArray}
                  />

                  <PointMarkers
                    datasetIndex={index} 
                    points={dataset.markers}
                  />

                  <AreaMarkers 
                    areas={dataset.areas} 
                  />

                  <InterpolationComponent
                    dataset={dataset}
                    datasetIndex={index} 
                    onToggleVisibility={handleToggleInterpolationVisibility}
                    onDeleteInterpolation={openDeleteDialog} 
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