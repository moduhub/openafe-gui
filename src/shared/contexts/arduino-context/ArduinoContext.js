import React, { createContext, useCallback, useContext, useState, useEffect } from 'react'

import { ReceivePorts } from '../../../arduino'

const ArduinoContext = createContext({});

export const useArduinoContext = () => {
  return useContext(ArduinoContext)
}

export const ArduinoProvider = ({ children }) => {
  const [arduinoData, setArduinoData] = useState('')
  const [portSelected, setPortSelected] = useState('')
  const [ports, setPorts] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isReading, setIsReading] = useState(false)
  
  const handleSetArduinoData = useCallback((newArduinoData)=>{
    setArduinoData(newArduinoData)
  }, [])
  const handleSetPortSelected = useCallback((newPortSelected)=>{
    setPortSelected(newPortSelected)
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

    const handleArduinoData = (data) => {
      handleSetArduinoData(data)
      console.log(data)
      console.log("Atualizado data")
    }
    const handleSerialPortOpened = (message) => {
      handleSetIsConnecting(true)
      console.log(message)
    }
    const handleSerialPortDisconnected = (message) => {
      console.log(message)
      handleSetPortSelected('')
      handleSetIsConnect(false)
      handleSetArduinoData('')
    }

    // Listeners
    window.electron.onArduinoData(handleArduinoData)
    window.electron.onSerialPortOpened(handleSerialPortOpened)
    window.electron.onSerialPortDisconnected(handleSerialPortDisconnected)

  },[])

  // Data Connect
  useEffect(() => {
    if (arduinoData.startsWith('$CONNECTED')){
      handleSetIsConnecting(false)
      handleSetIsConnect(true)
    }
  }, [arduinoData])

  return (
    <ArduinoContext.Provider value={{ 
      arduinoData, handleSetArduinoData,
      ports, handleSetPorts,
      portSelected, handleSetPortSelected, 
      isConnected, handleSetIsConnect,
      isConnecting, handleSetIsConnecting,
      isReading, handleSetIsReading
    }}>
      {children}
    </ArduinoContext.Provider>
  );
};

