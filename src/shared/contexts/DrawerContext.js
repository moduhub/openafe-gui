import { createContext, useCallback, useContext, useState } from 'react';

// Cria um contexto chamado DrawerContext com um valor padrão de um objeto vazio
const DrawerContext = createContext({});

// Exporta um hook personalizado chamado useDrawerContext que retorna o contexto DrawerContext
export const useDrawerContext = () => {
  return useContext(DrawerContext);
};

// Exporta um componente chamado DrawerProvider que recebe children como prop
export const DrawerProvider = ({ children }) => {
  const [drawerOptions, setDrawerOptions] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSetDrawerOptions = useCallback((newDrawerOptions) => {
    setDrawerOptions(newDrawerOptions);
  }, []);

  const toggleDrawerOpen = useCallback(() => {
    setIsDrawerOpen(oldDrawerOpen => !oldDrawerOpen);
  }, []);

  return (
    <DrawerContext.Provider value={{ isDrawerOpen, drawerOptions, toggleDrawerOpen, setDrawerOptions: handleSetDrawerOptions }}>
      {children}
    </DrawerContext.Provider>
  );
};