import { Button, AppBar, Toolbar, Typography, useTheme, Box } from '@mui/material';

export const MenuSuperior = ({ children }) => {

  const theme = useTheme();

  return(
    <>
      <AppBar position="static" sx={{ bgcolor: theme.palette.background.paper, color: theme.palette.text.primary }} >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }} marginLeft={theme.spacing(28)}>
            Menu Superior
          </Typography>
          <Button color="inherit">About</Button>
          <Button>Contact</Button>
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