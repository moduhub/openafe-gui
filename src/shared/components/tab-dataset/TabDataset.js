import { useState } from 'react'

import { Box, Card, CardContent, MenuItem, List, ListItem } from '@mui/material'
import { Button, Typography } from '@mui/material'; 
import IconButton from '@mui/material/IconButton'
import { Select } from '@mui/material'
import { useTheme } from '@mui/material'
import { FixedSizeList } from 'react-window';

import MinimizeIcon from '@mui/icons-material/Minimize'
import MaximizeIcon from '@mui/icons-material/Maximize'
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
            <>
              <List>
                <ListItem>
                  <Select
                    size='small'
                    sx={{ width: 200 }}
                    value={datasetSelected}
                    onChange={setDatasetSelected}
                  >
                    {datasets.length === 0 ? (
                    <MenuItem value="" disabled>Sem dados</MenuItem>
                  ) : (
                    datasets.map((dataset, i) => (
                      <MenuItem key={i} value={i}>
                        {dataset.name}
                      </MenuItem>
                    ))
                  )}
                  </Select>
                </ListItem>
                <ListItem>
                  <Box sx={{ height: 320, width: 200 }}>
                    {datasets.length === 0 || !datasets[datasetSelected] ? (
                      <Box sx={{ 
                        width: '100%', height: '100%', 
                        display: 'flex', 
                        alignItems: 'start', justifyContent: 'center'
                      }}>
                      </Box>
                    ) : (
                      <FixedSizeList
                        height={320}
                        width={200}
                        itemSize={46}
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
                </ListItem>
              </List>
              <Box width="100%" display="flex" justifyContent="end" gap={theme.spacing(3)}>
                <Button
                  onClick={handleDeleteDatasetSelected}
                  variant="contained"
                  color="error"
                  size="small"
                  disabled={!isDatasetSelected} 
                  style={{ opacity: !isDatasetSelected ? 0.5 : 1 }}
                >
                  <DeleteIcon />
                </Button>
              </Box>
            </>
            
          )}
          
        </CardContent>
      </Card>
    </Box>
  )
}