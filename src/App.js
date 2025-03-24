import React from 'react';
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from './routes';
import { AppThemeProvider, DrawerProvider } from './shared/contexts';
import { TopMenu, DrawerMenu } from './shared/components';
import { ArduinoProvider, DataSetsProvider, SettingsProvider } from './shared/contexts';

export const App = () => {
  return (
    <AppThemeProvider>
      <DrawerProvider>
        <ArduinoProvider>
          <DataSetsProvider>
            <SettingsProvider>
              <BrowserRouter>
                <TopMenu>
                  <DrawerMenu>
                    <AppRoutes />
                  </DrawerMenu>
                </TopMenu>
              </BrowserRouter>
            </SettingsProvider>
          </DataSetsProvider>
        </ArduinoProvider>
      </DrawerProvider>
    </AppThemeProvider>
  );
};