import React from 'react'

import { BrowserRouter } from "react-router-dom"
import { AppRoutes } from './routes'

import { AppThemeProvider, DrawerProvider } from './shared/contexts'
import { TopMenu, DrawerMenu } from './shared/components'

import { UseArduino } from './shared/hooks'

export const App = ()=>{

  const { 
    arduinoData, setArduinoData,
    ports, setPorts,
    isConnected, setIsConnected,
    portSelected, setPortSelected  
  } = UseArduino();

  window.electron.onArduinoData((data) => {
    setArduinoData(data);
    console.log(data);
  });

  window.electron.onSerialPortOpened((message) => {
    console.log(message);
    setIsConnected(true);
    console.log("CONECTADO")
  });

  window.electron.onSerialPortDisconnected((message) => {
    console.log(message);
    setPortSelected('');
    setIsConnected(false);
    console.log("DESCONECTADO")
  });

  return (
    <AppThemeProvider>
      <DrawerProvider>
        <BrowserRouter>
          <TopMenu>
            <DrawerMenu>
              <AppRoutes />
            </DrawerMenu>
          </TopMenu>
        </BrowserRouter>
      </DrawerProvider>
    </AppThemeProvider>
  )
}