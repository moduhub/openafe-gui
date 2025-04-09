import { 
  createContext,
  useCallback, 
  useContext, 
  useEffect, 
  useState 
} from 'react'

const DashboardContext = createContext()

export const useDashboardContext = () => {
  return useContext(DashboardContext)
}

export const DashboardProvider = ({ children }) => {
  const [tabArduinoIsMinimized, setTabArduinoIsMinimized] = useState(false)
  const [tabDatasetsIsMinimized, setTabDatasetsIsMinimized] = useState(true)

  const handleToggleTabArduinoMinimized = useCallback(() => {
    setTabArduinoIsMinimized((prevState) => !prevState);
  }, [])
  const handleToggleTabDatasetsMinimized = useCallback(() => {
    setTabDatasetsIsMinimized((prevState) => !prevState);
  }, [])

  return (
    <DashboardContext.Provider value={{ 
      tabArduinoIsMinimized, handleToggleTabArduinoMinimized,
      tabDatasetsIsMinimized, handleToggleTabDatasetsMinimized
    }}>
      {children}
    </DashboardContext.Provider>
  )
}
