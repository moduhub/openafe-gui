import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

import { createContext, useCallback, useContext, useState, useEffect } from 'react'

import { ReceivePorts } from '../../../arduino'

import { useDashboardContext } from '..'

const ArduinoContext = createContext({})

/**
 * Returns the current value of the Arduino context.
 * 
 * @returns {object} - The Arduino context value
 */
export const useArduinoContext = () => {
  return useContext(ArduinoContext)
}

/**
 * ArduinoProvider manages the state and context for Arduino serial communication
 * 
 * Responsibilities:
 * - Manages connection state, selected ports, and incoming Arduino data
 * - Listens for Electron IPC events related to Arduino communication
 * - Exposes context values and setters for consuming components
 * - Displays status messages via a Snackbar
 * 
 * @param {ReactNode} children - React children components to be wrapped by this context provider
 * 
 * @returns {JSX.Element} 
 */
export const ArduinoProvider = ({ children }) => {
  const [arduinoData, setArduinoData] = useState('')
  const [portSelected, setPortSelected] = useState('')
  const [portConnected, setPortConnected] = useState('')
  const [ports, setPorts] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isReading, setIsReading] = useState(false)

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  const {
    tabArduinoIsMinimized: isArduinoMinimized, 
    handleToggleTabArduinoMinimized: setIsArduinoMinimized,
  } = useDashboardContext()
  
  const handleSetArduinoData = useCallback((newArduinoData)=>{
    setArduinoData(newArduinoData)
  }, [])
  const handleSetPortSelected = useCallback((newPortSelected)=>{
    setPortSelected(newPortSelected)
  }, [])
  const handleSetPortConnected = useCallback((newPortConnected)=>{
    setPortConnected(newPortConnected)
  }, [])
  const handleSetPorts = useCallback((newPorts)=>{
    setPorts(newPorts)
  }, [])
  const handleSetIsConnect = useCallback((newIsConnect)=>{
    setIsConnected(newIsConnect)
  }, [])
  const handleSetIsConnecting = useCallback((newIsConnect)=>{
    setIsConnecting(newIsConnect)
  }, [])
  const handleSetIsReading = useCallback((newIsReading)=>{
    setIsReading(newIsReading)
  }, [])

  // Arduino Context Constructor
  useEffect(()=>{
    ReceivePorts(setPorts)

    const handleArduinoData = (data) => handleSetArduinoData(data)
    const handleSerialPortOpened = (message) => {
      if(!message.startsWith("not-connected")){
        handleSetIsConnecting(true)
        setSnackbar({ open: true, message: 'Connecting to Arduino...', severity: 'info' })
      }
    }
    const handleSerialPortDisconnected = (message) => {
      handleSetPortConnected('')
      handleSetPortSelected('')
      handleSetIsConnect(false)
      handleSetArduinoData('')
      setSnackbar({ open: true, message: 'Desconectado com sucesso!', severity: 'success' })
    }

    // Listeners
    window.electron.onArduinoData(handleArduinoData)
    window.electron.onSerialPortOpened(handleSerialPortOpened)
    window.electron.onSerialPortDisconnected(handleSerialPortDisconnected)

    // Destructor
    return () => {
      window.electron.onArduinoData(null)
      window.electron.onSerialPortOpened(null)
      window.electron.onSerialPortDisconnected(null)
    }
  },[])

  // Data Connect
  useEffect(() => {
    if (arduinoData.startsWith('$CONNECTED')){
      handleSetPortConnected(portSelected)
      handleSetIsConnecting(false)
      handleSetIsConnect(true)
      setSnackbar({ open: false, message: '', severity: 'info' }) 
      setSnackbar({ open: true, message: 'Conectado com sucesso na porta '+portSelected+'!', severity: 'success' })
      if(isArduinoMinimized)
        setIsArduinoMinimized()
    }
  }, [arduinoData])

  return (
    <ArduinoContext.Provider value={{ 
      arduinoData, handleSetArduinoData,
      ports, handleSetPorts,
      portSelected, handleSetPortSelected, 
      portConnected, handleSetPortConnected,
      isConnected, handleSetIsConnect,
      isConnecting, handleSetIsConnecting,
      isReading, handleSetIsReading
    }}>
      {children}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === 'success' ? 4000 : null}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ArduinoContext.Provider>
  )
}