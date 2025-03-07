import { Avatar, Button, AppBar, Toolbar, Typography, useTheme, Box, Select, MenuItem, Tooltip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import RefreshIcon from '@mui/icons-material/Refresh';
import MenuIcon from '@mui/icons-material/Menu'; // Importando o ícone de Menu

export const MenuSuperior = ({ children }) => {

  const theme = useTheme();

  return(
    <>
      <AppBar position="static" sx={{ bgcolor: theme.palette.background.paper, color: theme.palette.text.primary, height: theme.spacing(8)}} >
        <Toolbar>

          <Box width={theme.spacing(28)} height={theme.spacing(8)} display="flex" alignItems="center" justifyContent="center">
            <MenuIcon sx={{ height: theme.spacing(3), width: theme.spacing(3), marginRight: theme.spacing(1) }} />
            <Typography variant="h6" component="div" sx={{ marginLeft: theme.spacing(1) }}>
              OPENAFE
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} display="flex" alignItems="center">
            <Tooltip title="Conectar">
              <Button color="inherit">
                <CheckIcon />
              </Button>
            </Tooltip>
            <Select defaultValue="não-conectado" sx={{ mx: 2 , width: 200}}>
              <MenuItem value="não-conectado" sx={{ display: 'none' }}>Não Conectado</MenuItem>
            </Select>
            <Tooltip title="Recarregar">
              <Button color="inherit">
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
  )
}