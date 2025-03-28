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

export const TabDatasetAdavanced = () => {

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
              
            </>
            
          )}
          
        </CardContent>
      </Card>
    </Box>
  )
}