import { Drawer, List, ListItemText, useTheme } from '@mui/material';
import { Box } from '@mui/system';

export const MenuLateral = ({ children }) => {
  const theme = useTheme();

  return (
    <>
      <Drawer variant='permanent'>
        <Box width={theme.spacing(28)} height="100%" display="flex" flexDirection="column">
          <List component="nav">
            <ListItemText primary="Página inicial" />
          </List>
        </Box>
      </Drawer>

      <Box height="100%" marginLeft={theme.spacing(28)} marginTop={theme.spacing(8)}>
        {children}
      </Box>
    </>
  );
};