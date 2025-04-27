import { useState } from 'react'

import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  useTheme,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material'

import { FixedSizeList } from 'react-window'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import SaveAltIcon from '@mui/icons-material/SaveAlt'
import DeleteIcon from '@mui/icons-material/Delete'
import StartIcon from '@mui/icons-material/Start'

import {
  useDatasetsContext,
} from '../../contexts'

export const TabStorage = ({ setTabIndex, updateVisibility }) => {

  const theme = useTheme()
  const {
    handleDeleteDataset, handleSetDatasetSelected,
    datasets
  } = useDatasetsContext()

  const [open, setOpen] = useState(false)
  const [indexToDelete, setIndexToDelete] = useState(null)
  const handleClickOpen = (index) => {
    setIndexToDelete(index)
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
    setIndexToDelete(null)
  }
  const handleDelete = () => {
    if (indexToDelete !== null) handleDeleteDataset(indexToDelete)
    handleClose()
  }

  const handleOpenTabFilter = (index) => {
    handleSetDatasetSelected(index)
    setTabIndex(1)
    updateVisibility(index)
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <p>Você tem certeza de que deseja excluir este item?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="primary">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

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

            const formatPoint = (val) => Number(val).toFixed(1)

            const xArray = dataset.data[0].x
            const yArray = dataset.data[0].y

            let maxIndex = 0
            let minIndex = 0
            for (let i = 1; i < yArray.length; i++) {
              if (yArray[i] > yArray[maxIndex]) maxIndex = i
              if (yArray[i] < yArray[minIndex]) minIndex = i
            }
            const criticalPoints = [
              { index: maxIndex, x: xArray[maxIndex], y: yArray[maxIndex] },
              { index: minIndex, x: xArray[minIndex], y: yArray[minIndex] }
            ]

            return (
              <Accordion key={index}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  {dataset.name || `Dataset ${index + 1}`}
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
                      { onClick: () => datasets[index].setIsVisible(), icon: datasets[index].visible ? <VisibilityOffIcon /> : <VisibilityIcon /> },
                      { icon: <SaveAltIcon /> },
                      { onClick: () => handleClickOpen(index), icon: <DeleteIcon /> },
                      { onClick: () => handleOpenTabFilter(index), icon: <StartIcon /> }
                    ].map((btn, i) => (
                      <Button
                        key={i}
                        onClick={btn.onClick}
                        sx={{
                          minWidth: 'auto',
                          justifyContent: 'space-between'
                        }}
                        width="100%"
                      >
                        {btn.icon}
                      </Button>
                    ))}
                  </Box>

                  {/* Parameters */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      Parameters
                    </AccordionSummary>
                    <AccordionDetails>
                      settlingTime: {dataset.params.settlingTime}<br />
                      startPotential: {dataset.params.startPotential}<br />
                      endPotential: {dataset.params.endPotential}<br />
                      step: {dataset.params.step}<br />
                      scanRate: {dataset.params.scanRate}<br />
                      cycles: {dataset.params.cycles}<br />
                    </AccordionDetails>
                  </Accordion>

                  {/* Points */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      Points
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ height: 150, width: "100%" }}>
                        <FixedSizeList
                          height={150}
                          width="100%"
                          itemSize={35}
                          itemCount={xArray.length}
                          overscanCount={5}
                        >
                          {({ index, style }) => (
                            <Box style={style}>
                              {index}: [{formatPoint(xArray[index])}; {formatPoint(yArray[index])}]
                            </Box>
                          )}
                        </FixedSizeList>
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  {/* Critical Points */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      Critical Points
                    </AccordionSummary>
                    <AccordionDetails>
                      {criticalPoints.map((pt, i) => (
                        <Box key={i}>
                          {pt.index}: [{formatPoint(pt.x)}; {formatPoint(pt.y)}]
                        </Box>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                </AccordionDetails>
              </Accordion>
            )
          })
        )}
      </Box>
    </>
  )
}
