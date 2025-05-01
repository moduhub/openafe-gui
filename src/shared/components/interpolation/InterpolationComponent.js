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

import { FixedSizeList } from 'react-window'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'

import {
  useDatasetsContext,
} from '../../contexts'

import {
  DeleteDialog, 
  useDeleteDialog,
} from '..'

export const InterpolationComponent = ({ 
  dataset, 
  datasetIndex, 
  onToggleVisibility, 
  onDeleteInterpolation 
}) => {
  
  const theme = useTheme()

  return (
    <>
      {dataset.interpolations && dataset.interpolations.length > 0 ? (
        dataset.interpolations.map((interpolation, i) => (
          <Accordion key={i} width="100%">
           <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                color: interpolation.isVisible ? 'inherit' : 'gray', 
              }}
            >
              {interpolation.name || `${interpolation.type} ${i + 1}`}
            </AccordionSummary>
            <AccordionDetails>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                marginBottom={2}
              >
                <Button
                  onClick={() => onToggleVisibility(datasetIndex, i)}
                  size="small"
                  startIcon={
                    interpolation.isVisible ? <VisibilityOffIcon /> : <VisibilityIcon />
                  }
                  //disabled = {dataset.visible ? false : true}
                >
                </Button>
                <Button
                  onClick={() => onDeleteInterpolation(datasetIndex, i)} 
                  size="small"
                  startIcon={<DeleteIcon />}
                >
                </Button>
              </Box>

              
              <Typography variant="body2" gutterBottom>
                Tipo: {interpolation.type}<br />
                Ordem: {interpolation.order}<br />
                Coeficientes: {interpolation.coefficients.join(", ")}
              </Typography>

              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  Pontos
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ height: 150, width: "100%" }}>
                    <FixedSizeList
                      height={150}
                      width="100%"
                      itemSize={35}
                      itemCount={interpolation.data[0].x.length}
                      overscanCount={5}
                    >
                      {({ index, style }) => (
                        <Box style={style}>
                          {index}: [
                          {Number(interpolation.data[0].x[index]).toFixed(1)}{" "}
                          {Number(interpolation.data[0].y[index]).toFixed(1)}]
                        </Box>
                      )}
                    </FixedSizeList>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <>
        </>
      )}
    </>
  )
}
