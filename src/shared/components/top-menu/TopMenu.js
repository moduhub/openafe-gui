import React from 'react';
import { Button, AppBar, Toolbar, Typography, useTheme, Box, Select, MenuItem, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MenuIcon from '@mui/icons-material/Menu';

import { useDrawerContext } from '../../contexts';
import { UseArduino } from '../../hooks';
import { DisconnectPort, ReceivePorts, ConnectPort } from '../../../arduino';

export const TopMenu = ({ children }) => {
  
  const theme = useTheme();

  const { isDrawerOpen, drawerOptions, toggleDrawerOpen } = useDrawerContext(); 
  const { arduinoData, setArduinoData, ports, setPorts, isConnected, setIsConnected, portSelected, setPortSelected } = UseArduino();
  
  return (
    <>
      <AppBar position="static" sx={{ bgcolor: theme.palette.background.paper, color: theme.palette.text.primary, height: theme.spacing(8) }}>
        <Toolbar>
          <Button variant='papel' onClick={toggleDrawerOpen} width={theme.spacing(28)} height={theme.spacing(8)} display="flex">
            <MenuIcon sx={{ height: theme.spacing(3), width: theme.spacing(3), marginRight: theme.spacing(1) }} />
            <Typography variant="h6" component="div" sx={{ marginLeft: theme.spacing(1) }}>
              OPENAFE
            </Typography>
          </Button>

          <Box sx={{ flexGrow: 1 }} display="flex">
            <Select
              value={portSelected}
              onChange={(e) => setPortSelected(e.target.value)}
              sx={{ mx: 2, width: 200 }}
            >
              {isConnected ? (
                <MenuItem value="" onClick={() => DisconnectPort(setPortSelected, setIsConnected)}>Desconectar</MenuItem>
              ) : (
                <MenuItem value="" disabled>Não Conectado</MenuItem>
              )}
              {ports.map((port, index) => (
                <MenuItem 
                  key={index} 
                  value={port.path} 
                  onClick={() => ConnectPort(port.path, setPortSelected, setIsConnected)}
                >
                  {port.friendlyName}
                </MenuItem>
              ))}
            </Select>
            <Tooltip title="Recarregar">
              <Button color="inherit" onClick={() => ReceivePorts(setPorts, isConnected, setArduinoData)}>
                <RefreshIcon />
              </Button>
            </Tooltip>
          </Box>
          <Button color="inherit">Sobre</Button>
          <Button>Contato</Button>
        </Toolbar>
      </AppBar>

      <Box height='calc(100% - 64px)'> 
        {/* 64px é a altura do AppBar */}
        {children} {/* Conteúdo principal */}
      </Box>
    </>
  );
};
