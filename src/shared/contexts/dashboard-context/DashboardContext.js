import { 
  createContext,
  useCallback, 
  useContext, 
  useState 
} from 'react'

const DashboardContext = createContext()

/**
 * @brief Returns the current value of the Dashboard context
 * 
 * @returns {object} The Dashboard context value
 * 
 * Behavior:
 * - Provides access to dashboard layout state and toggle functions
 */
export const useDashboardContext = () => {
  return useContext(DashboardContext)
}

/**
 * @brief Provides the Dashboard context to its children
 * 
 * @param {React.ReactNode} children - The components that will receive the context
 * 
 * Behavior:
 * - Manages UI layout state, such as whether the Arduino and Datasets tabs are minimized
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