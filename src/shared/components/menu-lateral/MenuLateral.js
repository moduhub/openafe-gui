import { Typography, Divider, Drawer, Icon, List, ListItemButton, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import SettingsIcon from '@mui/icons-material/Settings'; // Importando o ícone de configurações
import HomeIcon from '@mui/icons-material/Home'; // Importando o ícone de Home
import BarChartIcon from '@mui/icons-material/BarChart'; // Importando o ícone de Estatísticas
import MenuIcon from '@mui/icons-material/Menu'; // Importando o ícone de Menu


export const MenuLateral = ({ children }) => {
  const theme = useTheme();

  return (
    <>
      <Drawer variant='permanent'>
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
                <ListItemButton>
                  <ListItemIcon>
                    <HomeIcon /> {/* Usando o ícone de Home da MUI */}
                  </ListItemIcon>
                  <ListItemText primary="Inicio" />
                </ListItemButton>
              </List>
            </Box>

            <Box>
              <List component="nav">
                <ListItemButton>
                  <ListItemIcon>
                    <BarChartIcon /> {/* Usando o ícone de Estatísticas da MUI */}
                  </ListItemIcon>
                  <ListItemText primary="Estatísticas" />
                </ListItemButton>
              </List>
            </Box>

            <Divider />

          </Box>

          <Box>
            <Divider />
            <Box>
              <List component="nav">
                <ListItemButton>
                  <ListItemIcon>
                    <SettingsIcon /> {/* Usando o ícone de configurações da MUI */}
                  </ListItemIcon>
                  <ListItemText primary="Configurações" />
                </ListItemButton>
              </List>
            </Box>
          </Box>
        </Box>
      </Drawer> 

      

      <Box height="100%" marginLeft={theme.spacing(28)} marginTop={theme.spacing(8)}>
        {children}
      </Box>
    </>
  );
};