import React from 'react';
import { Button, AppBar, Toolbar, Typography, useTheme, Box, Select, MenuItem, Tooltip, Divider } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MenuIcon from '@mui/icons-material/Menu';

import { useDrawerContext } from '../../contexts';
import { useArduinoData } from '../../hooks';
import { iniciarLeitura, finalizarLeitura, desconectarPorta, receberPortas, conectarPorta } from '../arduino/ArduinoControle';

export const MenuSuperior = ({ children }) => {
  const theme = useTheme();
  const { isDrawerOpen, drawerOptions, toggleDrawerOpen } = useDrawerContext(); 
  const { arduinoData, portas, setPortas, isConnected, portaSelecionada, setPortaSelecionada } = useArduinoData();
  

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
              value={portaSelecionada}
              onChange={(e) => setPortaSelecionada(e.target.value)}
              sx={{ mx: 2, width: 200 }}
            >
              {isConnected ? (
                <MenuItem value="" onClick={desconectarPorta}>Desconectar</MenuItem>
              ) : (
                <MenuItem value="" disabled>Não Conectado</MenuItem>
              )}
              {portas.map((port, index) => (
                <MenuItem key={index} value={port.path} onClick={() => conectarPorta(port.path, setPortaSelecionada)}>
                  {port.friendlyName}
                </MenuItem>
              ))}
            </Select>
            <Tooltip title="Recarregar">
              <Button color="inherit" onClick={() => receberPortas(setPortas)}>
                <RefreshIcon />
              </Button>
            </Tooltip>
          </Box>
          <Button color="inherit">Sobre</Button>
          <Button>Contato</Button>
        </Toolbar>
      </AppBar>

      <Box>
        <Box display="flex" flex={1}>
          {children} {/* Conteúdo principal */}
        </Box>
        <Box width='100%' height='100%'>
          <Button onClick={iniciarLeitura} >Start</Button>
          <Button onClick={finalizarLeitura} >Stop</Button>
          <Divider />
          <Typography variant="body1">Arduino Data: {arduinoData}</Typography>
        </Box>
      </Box>
    </>
  );
};