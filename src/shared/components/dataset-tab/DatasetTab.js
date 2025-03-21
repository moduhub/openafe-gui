import { Box, Card, CardContent, MenuItem, List, ListItem } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { Select } from '@mui/material';
import { useTheme } from '@mui/material';

import MinimizeIcon from '@mui/icons-material/Minimize';
import MaximizeIcon from '@mui/icons-material/Maximize';

import { useState } from 'react';

export const DatasetTab=()=>{

  const theme = useTheme();

  const [isMinimized, setIsMinimized] = useState(false);

  return(
    <Box 
      width={isMinimized ? theme.spacing(12) : theme.spacing(35)}  
      height="80%"  
      display="flex"     
      flexShrink="0"
      marginTop={isMinimized ? null : theme.spacing(2)}  
      marginBottom={isMinimized ? null : theme.spacing(2)}
      transition="width 0.3s ease"
      alignItems="start"
      justifyContent="end"
      top={theme.spacing(12)}
    >
      <Card sx={{ borderRadius: isMinimized? '55px' : '16px' }}>
        <CardContent sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          '&:last-child': isMinimized?{paddingBottom: 1}:null, 
          padding:isMinimized?'8px':null 
        }}>
          
          {/* Botão de minimização */}
          <Box display="flex" justifyContent="end" flexDirection="row" width="100%">
            <IconButton aria-label="delete" size="small" onClick={() => setIsMinimized(!isMinimized)}>
              {isMinimized ? <MaximizeIcon /> : <MinimizeIcon />}
            </IconButton>
          </Box>

          {/* Campos de entrada */}
          {!isMinimized &&(
            <List>
              <ListItem>
                <Select
                  size='small'
                  sx={{ width: 200 }}
                >
                  <MenuItem value="" disabled>Sem dados</MenuItem>
                </Select>
              </ListItem>

            </List>
          )}

          {/* Botões de controle */}
        </CardContent>
      </Card>
    </Box>
  )
}