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
  const handleSetIsReading = useCallback((newIsReading)=>{
    setIsReading(newIsReading)
  }, [])

  // Arduino Context Constructor
  useEffect(()=>{
    ReceivePorts(setPorts)

    const handleArduinoData = (data) => {
      handleSetArduinoData(data)
      //console.log(data)
    }
    const handleSerialPortOpened = (message) => {
      console.log(message)
    }
    const handleSerialPortDisconnected = (message) => {
      console.log(message)
      handleSetPortSelected('')
      handleSetIsConnect(false)
    }

    // Listeners
    window.electron.onArduinoData(handleArduinoData)
    window.electron.onSerialPortOpened(handleSerialPortOpened)
    window.electron.onSerialPortDisconnected(handleSerialPortDisconnected)

    // Arduino Context Destructor
    return()=>{
      window.electron.offArduinoData(handleArduinoData)
      window.electron.offSerialPortOpened(handleSerialPortOpened)
      window.electron.offSerialPortDisconnected(handleSerialPortDisconnected)
    }
  },[])

  return (
    <ArduinoContext.Provider value={{ 
      arduinoData, handleSetArduinoData,
      ports, handleSetPorts,
      portSelected, handleSetPortSelected, 
      isConnected, handleSetIsConnect,
      isReading, handleSetIsReading
    }}>
      {children}
    </ArduinoContext.Provider>
  );
};

