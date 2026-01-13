import { createTheme } from '@mui/material/styles';
import { purple, yellow } from '@mui/material/colors';

/**
 * @brief Dark theme for the application using Material-UI.
 */
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
    },
    text: {
      primary: '#ffffff',              // garante texto branco em inputs/selects
      secondary: 'rgba(255,255,255,0.7)'
    },
    divider: 'rgba(255,255,255,0.12)'
  },
  typography: {
    allVariants: {
      color: 'white',
    }
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          color: '#fff'
        },
        root: {
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.23)' }
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: 'rgba(255,255,255,0.7)' }
      }
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          color: '#fff'
        },
        icon: {
          color: '#fff'
        }
      }
    }
  }
});