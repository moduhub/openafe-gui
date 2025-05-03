import { useState, useEffect } from 'react'

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

import {
  useDatasetsContext,
  useArduinoContext
} from '../../contexts'

import {
  DeleteDialog, 
  useDeleteDialog,
  InterpolationComponent,
  ParametersComponent,
  PointsComponent
} from '..'

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

  const { openDialog, index, open, close } = useDeleteDialog()

  const handleDelete = () => {
    if (index !== null) handleDeleteDataset(index)
    close()
  }
  const handleOpenTabFilter = (index) => {
    handleSetDatasetSelected(index)
    setTabIndex(1)
    showOnlyDataset(index)
  }

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState({ datasetIndex: null, interpolationIndex: null })

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

      <Box
        sx={{
          height: 440,
          width: 248,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
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
            Não há datasets em cache no momento.
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

                  {/* Parameters */}
                  <ParametersComponent 
                    dataset={dataset}
                  />

                  {/* Points */}
                  <PointsComponent
                    formatPoint={formatPoint}
                    xArray={xArray}
                    yArray={yArray}
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
