import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

import { createContext, useCallback, useContext, useState, useEffect } from 'react'

import { ReceivePorts } from '../../../arduino'

const ArduinoContext = createContext({})

/**
 * @brief Returns the current value of the Arduino context.
 * 
 * @returns {object} - The Arduino context value
 * 
 * Behavior:
 * - Provides access to Arduino connection state, selected ports, and incoming data
 */
export const useArduinoContext = () => {
  return useContext(ArduinoContext)
}

/**
 * @brief ArduinoProvider manages the state and context for Arduino serial communication
 * 
 * @param {ReactNode} children - React children components to be wrapped by this context provider
 * 
 * Behavior:
 * - Initializes state for connection status, selected ports, and incoming data
 * - Sets up IPC event listeners on mount and cleans them up on unmount
 * - Updates connection state based on incoming data messages
 * - Displays Snackbar notifications for connection status and errors
 */
export const ArduinoProvider = ({ children }) => {
  const [isDummy, setIsDummy] = useState(false)
  const [arduinoData, setArduinoQueue] = useState([])
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
  
  //const handleSetArduinoData = useCallback((newArduinoData)=>{setArduinoData(newArduinoData)}, [])
  const pushArduinoData = useCallback((data) => {
    setArduinoQueue(prev => [...prev, data])
  }, [])
  const clearArduinoData = useCallback(() => {
    setArduinoQueue([])
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

    const handleSerialPortOpened = (message) => {
      if(message.startsWith("Serial port opened successfully!")){
        handleSetIsConnecting(true)
        setSnackbar({ open: true, message: 'Connecting to Arduino...', severity: 'info' })
      }
      
      if(message.startsWith("not-connected:Error: Opening COM3: Access denied")){
        handleSetIsConnecting(false)
        setSnackbar({ open: true, message: 'Access denied', severity: 'error' })
      }
    }
    const handleSerialPortDisconnected = (message) => {
      handleSetPortConnected('')
      handleSetPortSelected('')
      handleSetIsConnect(false)
      clearArduinoData()
      setSnackbar({ open: true, message: 'Disconnected successfully!', severity: 'success' })
    }

    // Listeners
    const offArduino = window.electron.onArduinoData(pushArduinoData)
    const offOpened = window.electron.onSerialPortOpened(handleSerialPortOpened)
    const offDisconnected = window.electron.onSerialPortDisconnected(handleSerialPortDisconnected)


    // Destructor
    return () => {
      offArduino && offArduino()
      offOpened && offOpened()
      offDisconnected && offDisconnected()
    }
  },[])

  return (
    <ArduinoContext.Provider value={{ 
      arduinoData, pushArduinoData, clearArduinoData,
      ports, handleSetPorts,
      portSelected, handleSetPortSelected, 
      portConnected, handleSetPortConnected,
      isConnected, handleSetIsConnect,
      isConnecting, handleSetIsConnecting,
      isReading, handleSetIsReading,
      isDummy, setIsDummy,
      setSnackbar
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