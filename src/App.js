import React from 'react';
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from './routes';
import { 
  AppThemeProvider, 
  DrawerProvider 
} from './shared/contexts';
import { 
  TopMenu, 
  DrawerMenu 
} from './shared/components';
import { 
  ArduinoProvider, 
  DataSetsProvider, 
  SettingsProvider, 
  DashboardProvider 
} from './shared/contexts';

export const App = () => {
  return (
    <AppThemeProvider>
      <DrawerProvider>
        <SettingsProvider>
          <ArduinoProvider>
            <DataSetsProvider>
              <DashboardProvider>
                <BrowserRouter>
                  <TopMenu>
                    <DrawerMenu>
                      <AppRoutes />
                    </DrawerMenu>
                  </TopMenu>
                </BrowserRouter>
              </DashboardProvider>
            </DataSetsProvider>
          </ArduinoProvider>
        </SettingsProvider>
      </DrawerProvider>
    </AppThemeProvider>
  );
};