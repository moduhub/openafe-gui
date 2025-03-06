import { createTheme } from '@mui/material/styles';
import { purple, yellow } from '@mui/material/colors';

export const DarkTheme = createTheme({
  palette: {
    primary: {
      main: yellow[700],
      dark: yellow[800],
      light: yellow[500],
      contrastText: '#fff',
    },
    secondary: {
      main: purple[500],
      dark: purple[400],
      light: purple[300],
      contrastText: '#fff',
    },
    background: {
      paper: '#303134',
      default: '#202124',
    }
  },
  typography: {
    allVariants: {
      color: 'white',
    }
  }
});