import { 
  createContext,
  useCallback, 
  useContext, 
  useState 
} from 'react'

const DashboardContext = createContext()

/**
 * Returns the current value of the Dashboard context
 * 
 * @returns {object} The Dashboard context value
 */
export const useDashboardContext = () => {
  return useContext(DashboardContext)
}

/**
 * Provides the Dashboard context to its children
 * 
 * Manages UI layout state, such as whether the Arduino and Datasets tabs are minimized
 * 
 * @param {React.ReactNode} children - The components that will receive the context
 * 
 * @returns {JSX.Element} 
 */
export const DashboardProvider = ({ children }) => {
  const [tabArduinoIsMinimized, setTabArduinoIsMinimized] = useState(false)
  const [tabDatasetsIsMinimized, setTabDatasetsIsMinimized] = useState(false)

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