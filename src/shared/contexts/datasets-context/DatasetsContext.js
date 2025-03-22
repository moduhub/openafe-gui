import React, { createContext, useCallback, useContext, useState, useEffect } from 'react'

import { ThemeContext } from '..';
import { useArduinoContext } from '..'

const DatasetsContext = createContext({});

export const useDatasetsContext = () => {
  return useContext(DatasetsContext)
}

export const DataSetsProvider = ({ children }) => {

  const { theme } = useContext(ThemeContext);

  const { 
    arduinoData, handleSetArduinoData,
    ports, handleSetPorts,
    isConnected, handleSetIsConnect,
    portSelected, handleSetPortSelected, 
    isReading, handleSetIsReading 
  } = useArduinoContext();

  const [currentName, setCurrentName ] = useState("default name");
  const [datasets, setDatasets]= useState([])

  const handleCurrentName = useCallback((newName)=>{
    setCurrentName(newName)
  }, [])

  const setNewDataSet = (name_) => {
    setDatasets(prevDatasets => [
      ...prevDatasets,
      { name: name_, points: [] }
    ]);
  };

  const addDataPoint = (voltage, current) => {
    setDatasets(prevDatasets => {
      const updatedDatasets = [...prevDatasets]
      const lastDataset = updatedDatasets[updatedDatasets.length - 1]
      if (lastDataset) {
        lastDataset.points.push({ 
          x: voltage, 
          y: current, 
          mode: 'lines', 
          line: { color: theme.palette.primary.main }
        });
      }
      return updatedDatasets
    })
  }

  useEffect(()=>{
    // Data Connect
    if (arduinoData.startsWith('$CONNECT')){
      console.log("Conectado")
      handleSetIsConnect(true)
    }
    // Data graph
    if (arduinoData.startsWith('$SGL')) {
      const dataParts = arduinoData.split(',')
      if (dataParts.length >= 3) {
        const voltage = parseFloat(dataParts[1])
        const current = parseFloat(dataParts[2].split('*')[0])
        console.log("tensão: "+voltage+" ; Corrente: "+current)
        addDataPoint(voltage, current);
      }
    }
    // Data start
    else if(arduinoData.startsWith('$START')){
      setNewDataSet(currentName)
      console.log("Iniciado leitura de "+currentName)
    }
    // Data end
    else if(arduinoData.startsWith('$END')){
      const motive = arduinoData.split(',')
      console.log("Finalizado por "+ motive[1])
      handleSetIsReading(false)
      console.log(datasets)
    }
  },[arduinoData])

  return (
    <DatasetsContext.Provider value={{ 
      currentName, handleCurrentName,
      datasets
    }}>
      {children}
    </DatasetsContext.Provider>
  );
};

