import { 
  useTheme, 
  Button,  
} from '@mui/material';
import { Box } from '@mui/material';

import { useDashboardContext } from '../../contexts';
import MinimizeIcon from '@mui/icons-material/Minimize';
import SdStorageIcon from '@mui/icons-material/SdStorage';
import MemoryIcon from '@mui/icons-material/Memory';

export const TabBottom = ({ children }) => {
  const theme = useTheme();

  const {
      tabArduinoIsMinimized: isArduinoMinimized, 
      handleToggleTabArduinoMinimized: setIsArduinoMinimized, 
      tabDatasetsIsMinimized: isDatasetMinimized, 
      handleToggleTabDatasetsMinimized: setIsMinimizedDataset,
  } = useDashboardContext();

  return (
    <Box 
      height="64px" 
      width="calc(100% - 25px)" 
      position="absolute" 
      bottom="0" 
      bgcolor="white" 
      display="flex" 
      justifyContent="start" 
      alignItems="center"
      zIndex={2}
      gap="25px"
      marginLeft="25px"
    >
      {/* Botão Arduino */}
      <Button 
        variant="contained" 
        style={{
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
          borderRadius: 0, 
          minWidth: "120px", 
          backgroundColor: isDatasetMinimized ? theme.palette.grey[400] : theme.palette.primary.main 
        }}
        onClick={setIsMinimizedDataset}
      >
        <MemoryIcon />
      </Button>
    </Box>
  );
};
