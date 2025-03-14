import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material';
import { Box } from '@mui/system';

import { DarkTheme, LightTheme } from '../themes';

// Cria um contexto para o tema
const ThemeContext = createContext();

// Hook personalizado para usar o ThemeContext
export const useAppThemeContext = () => {
  return useContext(ThemeContext);
}

// Componente para fornecer o contexto do tema aos seus filhos
export const AppThemeProvider = ({ children }) => {
  // Estado para gerenciar o nome do tema atual, o padrão é 'light
  const [themeName, setThemeName] = useState('light');

  // Função para alternar entre os temas claro e escuro
  const toggleTheme = useCallback(() => {
    setThemeName(oldThemeName => oldThemeName === 'light' ? 'dark' : 'light');
  }, []);

  // Memoriza o objeto do tema com base no nome do tema atual
  const theme = useMemo(() => {
    if (themeName === 'light') return LightTheme;

    return DarkTheme;
  }, [themeName]);

  // Fornece o contexto do tema e aplica o tema usando ThemeProvider
  return (
    <ThemeContext.Provider value={{ themeName, toggleTheme, theme }}>
      <ThemeProvider theme={theme}>
        <Box width="100vw" height="100vh" bgcolor={theme.palette.background.default}>
          {children}
        </Box>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

// Adicione esta linha para exportar o ThemeContext
export { ThemeContext };