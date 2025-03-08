import React, { useEffect } from 'react'

import { BrowserRouter } from "react-router-dom"
import { AppRoutes } from './routes'

import { AppThemeProvider, DrawerProvider } from './shared/contexts'
import { MenuSuperior, MenuLateral } from './shared/components'
export const App = ()=>{
  return (
    <AppThemeProvider>
      <DrawerProvider>
        <BrowserRouter>

          <MenuSuperior>
            <MenuLateral>
              <AppRoutes/>
            </MenuLateral>
          </MenuSuperior>

        </BrowserRouter>
      </DrawerProvider>
    </AppThemeProvider>
  )
}