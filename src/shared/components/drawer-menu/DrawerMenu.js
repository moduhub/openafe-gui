import { Typography, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import BarChartIcon from '@mui/icons-material/BarChart';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom'; // Importando o hook useNavigate

import { useDrawerContext } from '../../contexts';

export const DrawerMenu = ({ children }) => {

  const theme = useTheme();
  const { isDrawerOpen, toggleDrawerOpen } = useDrawerContext();
  const navigate = useNavigate();

  return (
    <>
      <Drawer variant='temporary' open={isDrawerOpen} onClose={toggleDrawerOpen}>
      <Box width={theme.spacing(28)} height="100%" display="flex" flexDirection="column" justifyContent="space-between">
          <Box>

            <Box width="100%" height={theme.spacing(8)} display="flex" alignItems="center" justifyContent="center">
              <MenuIcon sx={{ height: theme.spacing(3), width: theme.spacing(3), marginRight: theme.spacing(1) }} />
              <Typography variant="h6" component="div" sx={{ marginLeft: theme.spacing(1) }}>
                OPENAFE
              </Typography>
            </Box>

            <Divider />

            <Box marginTop={theme.spacing(4)}>
              <List component="nav">
                <ListItemButton onClick={() => navigate('/home')}>
                  <ListItemIcon>
                    <HomeIcon /> {/* Usando o ícone de Home da MUI */}
                  </ListItemIcon>
                  <ListItemText primary="Home" />
                </ListItemButton>
              </List>
            </Box>

            <Box>
              <List component="nav">
                <ListItemButton onClick={() => navigate('/data-processing')}>
                  <ListItemIcon>
                    <BarChartIcon /> {/* Usando o ícone de Estatísticas da MUI */}
                  </ListItemIcon>
                  <ListItemText primary="Data Processing" />
                </ListItemButton>
              </List>
            </Box>

          </Box>

          <Box>
            <Divider />
            <Box>
              <List component="nav">
                <ListItemButton onClick={() => navigate('/settings')}>
                  <ListItemIcon>
                    <SettingsIcon /> {/* Usando o ícone de configurações da MUI */}
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </ListItemButton>
              </List>
            </Box>
          </Box>
        </Box>
      </Drawer>    

      <Box height="100%">
        {children}
      </Box>
    </>
  );
};