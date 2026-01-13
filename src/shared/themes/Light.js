import { createTheme } from "@mui/material";
import { purple, yellow } from "@mui/material/colors"

/**
 * @brief Light theme for the application using Material-UI.
 */
export const LightTheme = createTheme({
  palette:{
    primary:{
      main: yellow[700],
      dark: yellow[800],
      light: yellow[500],
      contrastText:"#fff",
      lowContrast:"lightgray"
    },
    secondary:{
      main: purple[500],
      dark: purple[400],
      light: purple[300],
      contrastText:"#fff",
      lowContrast:"lightgray"
    },
    background:{
      paper:"#fff",
      default:"#f7f6f3"
    },
    text: {
      primary: '#000',                 // garante texto visível no modo claro
      secondary: 'rgba(0,0,0,0.7)'
    },
    divider: 'rgba(0,0,0,0.12)'
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          color: '#000'
        },
        root: {
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' }
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: 'rgba(0,0,0,0.6)' }
      }
    }
  }
})