import React, { useEffect } from 'react'
import { BrowserRouter } from "react-router-dom"
import { AppRoutes } from './routes'
import { AppThemeProvider, DrawerProvider } from './shared/contexts'
import { TopMenu, DrawerMenu } from './shared/components'
import { ArduinoProvider, DataSetsProvider } from './shared/contexts'

export const App = () => {

  return (
    <AppThemeProvider>
      <DrawerProvider>
        <ArduinoProvider>
          <DataSetsProvider>
            <BrowserRouter>
              <TopMenu>
                <DrawerMenu>
                  <AppRoutes />
                </DrawerMenu>
              </TopMenu>
            </BrowserRouter>
          </DataSetsProvider>
        </ArduinoProvider>
      </DrawerProvider>
    </AppThemeProvider>
  )

}