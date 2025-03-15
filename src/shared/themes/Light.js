import { createTheme } from "@mui/material";
import { purple, yellow } from "@mui/material/colors"

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
    }
  }
})