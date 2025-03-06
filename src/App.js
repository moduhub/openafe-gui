import { BrowserRouter } from "react-router-dom"
import { AppRoutes } from './routes'

import { AppThemeProvider } from './shared/contexts'
import { MenuSuperior, MenuLateral } from './shared/components'

export const App = ()=>{
  return (
    <AppThemeProvider>
        <BrowserRouter>

          <MenuSuperior>
            <MenuLateral>
              <AppRoutes/>
            </MenuLateral>
          </MenuSuperior>

        </BrowserRouter>
    </AppThemeProvider>
  )
}