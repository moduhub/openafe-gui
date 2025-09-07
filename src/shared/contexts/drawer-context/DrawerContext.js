import { createContext, useCallback, useContext, useState } from 'react'
import { Box } from '@mui/system'

const DrawerContext = createContext({})

/**
 * @brief Custom hook to access the Drawer context
 *
 * @returns {object} 
 */
export const useDrawerContext = () => {
  return useContext(DrawerContext)
}

/**
 * @brief Provides the Drawer context to its children
 * 
 * Manages drawer open/close state and dynamic drawer options
 * Useful for layout and navigation logic within the application
 *
 * @param {React.ReactNode} children
 * 
 * Behavior:
 * - Initializes state for drawer options and open/close status
 * - Provides functions to toggle drawer state and update options
 */
export const DrawerProvider = ({ children }) => {
  const [drawerOptions, setDrawerOptions] = useState([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleSetDrawerOptions = useCallback((newDrawerOptions) => {
    setDrawerOptions(newDrawerOptions)
  }, [])

  const toggleDrawerOpen = useCallback(() => {
    setIsDrawerOpen(oldDrawerOpen => !oldDrawerOpen)
  }, [])

  return (
    <DrawerContext.Provider value={{ 
      isDrawerOpen, 
      drawerOptions, 
      toggleDrawerOpen, 
      setDrawerOptions: handleSetDrawerOptions 
    }}>
      <Box height="100%">
        {children}
      </Box>
    </DrawerContext.Provider>
  )
}