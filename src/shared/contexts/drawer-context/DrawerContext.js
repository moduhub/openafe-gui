import { createContext, useCallback, useContext, useState } from 'react'
import { Box } from '@mui/system'

const DrawerContext = createContext({})

export const useDrawerContext = () => {
  return useContext(DrawerContext)
}

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
  );
};