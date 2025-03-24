import { Button, AppBar, Toolbar, Typography, useTheme, Box, Select, MenuItem, Tooltip } from '@mui/material';

import { useDrawerContext } from '../../contexts';
import { useArduinoContext } from '../../contexts';
import { DisconnectPort, ReceivePorts, ConnectPort } from '../../../arduino';

import RefreshIcon from '@mui/icons-material/Refresh';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress'; // Para o ícone de carregamento



export const TopMenu = ({ children }) => {
  const theme = useTheme();
  const { toggleDrawerOpen } = useDrawerContext();
  const { 
    arduinoData, handleSetArduinoData,
    ports, handleSetPorts,
    portSelected, handleSetPortSelected, 
    isConnected, handleSetIsConnect,
    isConnecting, 
    isReading
  } = useArduinoContext();

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
              onChange={(e) => handleSetPortSelected(e.target.value)}
              sx={{ mx: 2, width: 225 }}
              size='small'
            >   
              {isConnected ? (
                <MenuItem value="" disabled={isReading} onClick={() => DisconnectPort()}>Desconectar</MenuItem>
              ) : (
                <MenuItem value="" disabled>Não Conectado</MenuItem>
              )}
              {ports.map((port, index) => (
                <MenuItem 
                  key={index} 
                  value={port.path} 
                  onClick={() => ConnectPort(port.path, handleSetPortSelected)}
                  disabled={isConnected}
                >
                  {isConnecting?<CircularProgress size={15} sx={{ marginRight: 1 }} />:""}
                  {port.friendlyName}
                </MenuItem>
              ))}
            </Select>
            <Tooltip title="Recarregar">
              <Button color="inherit" onClick={() => ReceivePorts(handleSetPorts, isConnected, handleSetArduinoData)}>
                <RefreshIcon />
              </Button>
            </Tooltip>
          </Box>
          <Button color="inherit">About</Button>
          <Button>Contact</Button>
        </Toolbar>
      </AppBar>

      <Box height='calc(100% - 64px)'>
        {/* 64px é a altura do AppBar */}
        {children} {/* Conteúdo principal */}
      </Box>
    </>
  );
};