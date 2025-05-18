import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ThemeProvider } from '@mui/material'
import { Box } from '@mui/system'

import { DarkTheme, LightTheme } from '../../themes'

export const ThemeContext = createContext()

/**
 * Custom hook to access the App Theme context
 *
 * @returns {object} The theme context value
 */
export const useAppThemeContext = () => {
  return useContext(ThemeContext)
}

/**
 * Provides application theme context to all nested components
 * 
 * Manages theme switching between light and dark modes, and wraps the app
 * with the selected theme using MUI's ThemeProvider
 *
 * @param {React.ReactNode} props.children
 * 
 * @returns {JSX.Element} 
 */
export const AppThemeProvider = ({ children }) => {
  
  const [themeName, setThemeName] = useState('light')

  const toggleTheme = useCallback(() => {
    setThemeName(oldThemeName => oldThemeName === 'light' ? 'dark' : 'light')
  }, [])

  const theme = useMemo(() => {
    if (themeName === 'light') return LightTheme

    return DarkTheme
  }, [themeName])

  return (
    <ThemeContext.Provider value={{ themeName, toggleTheme, theme }}>
      <ThemeProvider theme={theme}>
        <Box width="100vw" height="100vh" bgcolor={theme.palette.background.default}>
          {children}
        </Box>
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}