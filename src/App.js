import React from 'react';
import { 
  BrowserRouter, 
  useLocation 
} from "react-router-dom";
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

const AppContent = () => {

  const location = useLocation();
  const isFiltersRoute = location.pathname === "/filters";

  return (
    <AppThemeProvider>
      <DashboardProvider>
        <SettingsProvider>
          <ArduinoProvider>
            <DataSetsProvider>
              {isFiltersRoute ? (
                <AppRoutes />
              ) : (
                <DrawerProvider>
                  <TopMenu>
                    <DrawerMenu>
                      <AppRoutes />
                    </DrawerMenu>
                  </TopMenu>
                </DrawerProvider>
              )}
            </DataSetsProvider>
          </ArduinoProvider>
        </SettingsProvider>
      </DashboardProvider>
    </AppThemeProvider>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};