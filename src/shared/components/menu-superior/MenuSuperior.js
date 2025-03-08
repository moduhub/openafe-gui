import React, { useState, useEffect } from 'react';
import { Button, AppBar, Toolbar, Typography, useTheme, Box, Select, MenuItem, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MenuIcon from '@mui/icons-material/Menu';
import { useDrawerContext } from '../../contexts';

import { listPorts, connectPort, closePort } from '../arduino/ArduinoControle';

export const MenuSuperior = ({ children }) => {
  const theme = useTheme();
  const { isDrawerOpen, drawerOptions, toggleDrawerOpen } = useDrawerContext();

  const handleRefreshClick = async () => {
    await listPorts();
  };

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
            <Select defaultValue="não-conectado" sx={{ mx: 2 , width: 200}}>
              <MenuItem value="não-conectado" sx={{ display: 'none' }}>Não Conectado</MenuItem>
            </Select>
            <Tooltip title="Recarregar">
              <Button color="inherit" onClick={handleRefreshClick}>
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
      </Box>
    </>
  );
};