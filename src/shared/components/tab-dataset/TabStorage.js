import { useState } from 'react'

import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  useTheme,
  Typography,
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel
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

import {
  DeleteDialog, 
  useDeleteDialog,
  InterpolationComponent
} from '..'

export const TabStorage = ({ setTabIndex }) => {

  const theme = useTheme()
  const {
    handleDeleteDataset, 
    handleSetDatasetSelected,
    datasets,
    toggleDatasetVisibility,
    showOnlyDataset,
  } = useDatasetsContext()

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

  const [interpolationType, setInterpolationType] = useState('')
  const [point1Index, setPoint1Index] = useState('')
  const [point2Index, setPoint2Index] = useState('')
  const handleInterpolationTypeChange = (e) => {
    setInterpolationType(e.target.value)
  }
  const handlePoint1Change = (e) => {
    setPoint1Index(e.target.value)
    console.log("Alterado 1")
  }
  const handlePoint2Change = (e) => {
    setPoint2Index(e.target.value)
    console.log("Alterado 2")
  }
  const handleCalculate = () => {
    console.log(`Interpolando: [${point1Index} ; ${point2Index}] ${interpolationType}`)
    // Aqui você chama sua função de interpolação
  }

  return (
    <>
      <DeleteDialog
        open={openDialog}
        onClose={close}
        onDelete={handleDelete}
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

            const formatPoint = (val) => Number(val).toFixed(1)
            const xArray = dataset.data[0].x
            const yArray = dataset.data[0].y

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
                      { onClick: () => toggleDatasetVisibility(index), icon: datasets[index].visible ? <VisibilityOffIcon /> : <VisibilityIcon /> },
                      { icon: <SaveAltIcon /> },
                      { onClick: () => open(index), icon: <DeleteIcon /> },
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

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      Interpolação
                    </AccordionSummary>
                    <AccordionDetails>
                      <InterpolationComponent xArray={xArray} yArray={yArray} />
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
