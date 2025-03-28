import { useState } from 'react';

import {
  Box,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
} from '@mui/material';
import { Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material';

import { FixedSizeList } from 'react-window';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MinimizeIcon from '@mui/icons-material/Minimize';
import MaximizeIcon from '@mui/icons-material/Maximize';

import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import DeleteIcon from '@mui/icons-material/Delete';

import { useDatasetsContext } from '../../contexts'

export const TabDataset = () => {

  const theme = useTheme();
  const { 
    isDatasetSelected, handleSetIsDatasetSelected,
    datasetSelected, handleSetDatasetSelected,
    handleDeleteDatasetSelected,
    datasets
  } = useDatasetsContext()

  const [isMinimized, setIsMinimized] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const toggleAccordion = () => {
    setExpanded(!expanded);
  };

  const setDatasetSelected = (e) => {
    handleSetDatasetSelected(e.target.value);
    handleSetIsDatasetSelected(true);
  };

  return (
    <Box 
      width={isMinimized ? theme.spacing(12) : theme.spacing(35)}  
      height={isMinimized ? "80%" : null}
      display="flex"     
      flexShrink="0"
      marginTop={isMinimized ? null : theme.spacing(2)}  
      marginBottom={isMinimized ? null : theme.spacing(2)}
      transition="width 0.3s ease"
      alignItems="start"
      justifyContent="end"
      top={isMinimized ? theme.spacing(12) : null}
    >
      <Card sx={{ borderRadius: isMinimized ? '55px' : '16px' }}>
        <CardContent sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          '&:last-child': isMinimized ? { paddingBottom: 1 } : null, 
          padding: isMinimized ? '8px' : null 
        }}>
          
          <Box display="flex" justifyContent="end" flexDirection="row" width="100%">
            <IconButton 
              aria-label="toggle" 
              size="small" 
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <MaximizeIcon /> : <MinimizeIcon />}
            </IconButton>
          </Box>

          {!isMinimized && (
            <Box
              sx={{
                height: 440,
                width: 248,
                overflowY: 'auto', // Adiciona o scroll quando necessário
                display: 'flex',
                flexDirection: 'column',
                
              }}
            >
              {datasets.map((dataset, index) => (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {dataset.name || `Dataset ${index + 1}`}
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box width="100%"
                      display="flex"
                      marginBottom={1}
                      justifyContent='center'
                    >
                      <Button><VisibilityIcon /></Button>
                      <Button><SaveAltIcon/></Button>
                      <Button><DeleteIcon/></Button>
                    </Box>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        Parameters
                      </AccordionSummary>
                      <AccordionDetails>
                        settlingTime: {dataset.params.settlingTime}<br/>
                        startPotential: {dataset.params.startPotential}<br/>
                        endPotential: {dataset.params.endPotential}<br/>
                        step: {dataset.params.step}<br/>
                        scanRate: {dataset.params.scanRate}<br/>
                        cycles: {dataset.params.cycles}<br/>
                      </AccordionDetails>
                    </Accordion>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        Points
                      </AccordionSummary>
                      <AccordionDetails>
                      <Box sx={{ height: 150, width: "100%" }}>
                        {datasets.length === 0 || !datasets[datasetSelected] ? (
                          <Box sx={{ 
                            width: '100%', height: '100%', 
                            display: 'flex', 
                            alignItems: 'start', justifyContent: 'center'
                          }}>
                          </Box>
                        ) : (
                          <FixedSizeList
                            height={150}
                            width="100%"
                            itemSize={35}
                            itemCount={datasets[datasetSelected].data[0].x.length}
                            overscanCount={5}
                          >
                            {({ index, style }) => (
                              <Box style={style}>
                                {index}: [{datasets[datasetSelected].data[0].x[index]}; {datasets[datasetSelected].data[0].y[index]}]
                              </Box>
                            )}
                          </FixedSizeList>
                        )}
                      </Box>
                      </AccordionDetails>
                    </Accordion>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
          
        </CardContent>
      </Card>
    </Box>
  )
}