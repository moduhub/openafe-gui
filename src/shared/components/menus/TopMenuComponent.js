import { 
  Button, 
  AppBar, 
  Toolbar, 
  Typography, 
  useTheme, 
  Box, 
  Select, 
  MenuItem, 
  Tooltip,
  Divider
} from '@mui/material';

import { 
  useDrawerContext, 
  useArduinoContext,
  useDashboardContext
} from '../../contexts';
import { DisconnectPort, ReceivePorts, ConnectPort } from '../../../arduino';
import { useNavigate } from 'react-router-dom';

import SdStorageIcon from '@mui/icons-material/SdStorage';
import MemoryIcon from '@mui/icons-material/Memory';
import RefreshIcon from '@mui/icons-material/Refresh';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import CircularProgress from '@mui/material/CircularProgress'; // Para o ícone de carregamento

export const TopMenu = ({ children }) => {

  const theme = useTheme();

  const { toggleDrawerOpen } = useDrawerContext();
  const { 
    handleSetArduinoData,
    ports, handleSetPorts,
    handleSetPortSelected, 
    portConnected,
    isConnected,
    isConnecting, 
    isReading
  } = useArduinoContext();

  const navigate = useNavigate();

  const {
    tabArduinoIsMinimized: isArduinoMinimized, 
    handleToggleTabArduinoMinimized: setIsArduinoMinimized, 
    tabDatasetsIsMinimized: isDatasetMinimized, 
    handleToggleTabDatasetsMinimized: setIsMinimizedDataset,
} = useDashboardContext();

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
              value={portConnected}
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
            <Tooltip title="Reload">
              <Button color="inherit" onClick={() => ReceivePorts(handleSetPorts, isConnected, handleSetArduinoData)}>
                <RefreshIcon />
              </Button>
            </Tooltip>
          </Box>

          {/* Botão Arduino */}
          <Button 
            variant="contained" 
            style={{
              marginRight: theme.spacing(2),
              borderRadius: 0, 
              minWidth: "120px", 
              backgroundColor: isArduinoMinimized ? theme.palette.grey[400] : theme.palette.primary.main
            }}
            onClick={setIsArduinoMinimized}
          >
            <SdStorageIcon />
          </Button>
    
          {/* Botão Datasets */}
          <Button 
            variant="contained" 
            style={{
              marginRight: theme.spacing(1),
              borderRadius: 0, 
              minWidth: "120px", 
              backgroundColor: isDatasetMinimized ? theme.palette.grey[400] : theme.palette.primary.main 
            }}
            onClick={setIsMinimizedDataset}
          >
            <MemoryIcon />
          </Button>

          {/* Divider vertical */}
          <Divider orientation="vertical" flexItem sx={{ mx: 2, marginRight: theme.spacing(4) }} />

          {/* Button Settings */}
          <Tooltip title="Settings">
            <Button color="inherit" onClick={() => navigate('/settings')}>
              <SettingsIcon />
            </Button>
          </Tooltip>
        
        </Toolbar>
      </AppBar>

      <Box height='calc(100% - 64px)'>
        {/* 64px é a altura do AppBar */}
        {children} {/* Conteúdo principal */}
      </Box>
    </>
  );
};