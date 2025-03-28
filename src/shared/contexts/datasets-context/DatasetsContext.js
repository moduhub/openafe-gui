import React, { createContext, useCallback, useContext, useState, useEffect } from 'react'

import { useArduinoContext, ThemeContext, useSettingsContext } from '..'

const DatasetsContext = createContext({});

export const useDatasetsContext = () => {
  return useContext(DatasetsContext)
}

export const DataSetsProvider = ({ children }) => {

  const { theme } = useContext(ThemeContext)

  const { 
    arduinoData,
    handleSetIsReading 
  } = useArduinoContext()

  const {
    autoConnect, handleSetAutoConnect,
    maxDatasets, handleSetMaxDatasets,
    displayOption, handleSetDisplayOption,
    defaultName, handleSetDefaultName,
    deleteCache, handleSetDeleteCache,
    unitSystem, handleSetUnitSystem,
    tabIndex, handleSetTabIndex
  } = useSettingsContext()

  const [currentName, setCurrentName] = useState(defaultName)
  const [currentParams, setCurrentParams] = useState({
    settlingTime: 1000,
    startPotential: -800,
    endPotential: 0,
    step: 100,
    scanRate: 2,
    cycles: 1,
  })
  const [datasets, setDatasets]= useState([])
  const [isDatasetSelected, setIsDatasetSelected] = useState(false)
  const [datasetSelected, setDatasetSelected] = useState("")
  
  const handleCurrentName = useCallback((newName)=>{
    setCurrentName(newName)
  }, [])
  const handleCurrentParams = useCallback((newParams)=>{
    setCurrentParams(newParams)
  }, [])
  const handleSetDataset = useCallback((newDatasets)=>{
    setDatasets(newDatasets)
  }, [])
  const handleSetIsDatasetSelected = useCallback((setIsSelected)=>{
    setIsDatasetSelected(setIsSelected)
  }, [])
  const handleSetDatasetSelected = useCallback((newDatasetSelected)=>{
    setDatasetSelected(newDatasetSelected)
  }, [])
  const handleDeleteDatasetSelected = (e) => {
    handleSetDatasetSelected(0)
    const newDataSets = [...datasets]
    newDataSets.splice(datasetSelected, 1)
    handleSetDataset(newDataSets)
    if(datasets.length == 1){
      //console.log("Acabou ou datasets")
      handleSetDatasetSelected("")
      handleSetIsDatasetSelected(false)
    }
  }

  const cacheDatasetsManager = ()=>{
    if(datasets.length >= maxDatasets){
      const newDataSets = [...datasets]
      newDataSets.splice(0, 1)
      handleSetDataset(newDataSets)
    }
  }

  const setNewDataSet = (name_,parameters_) => {
    cacheDatasetsManager()
    setDatasets(prevDatasets => [
      ...prevDatasets, { 
        name: name_, 
        params: parameters_,
        data: [{ 
          x:[] ,y:[], 
          mode:'lines', 
          line: { color: theme.palette.primary.main } 
        }] 
      }
    ])
  };

  const addDataPoint = (voltage, current) => {
    setDatasets((prevDatasets) => {
      const updatedDatasets = [...prevDatasets];
      const lastDataset = updatedDatasets[updatedDatasets.length - 1];
  
      if (lastDataset && lastDataset.data && lastDataset.data[0]) {
        if (!Array.isArray(lastDataset.data[0].x)) {
          lastDataset.data[0].x = [];
        }
        if (!Array.isArray(lastDataset.data[0].y)) {
          lastDataset.data[0].y = [];
        }
        lastDataset.data[0].x.push(voltage);
        lastDataset.data[0].y.push(current);
      }
  
      return updatedDatasets;
    });
  };

  useEffect(()=>{
    // Data graph
    if (arduinoData.startsWith('$SGL')) {
      const dataParts = arduinoData.split(',')
      if (dataParts.length >= 3) {
        const voltage = parseFloat(dataParts[1])
        const current = parseFloat(dataParts[2].split('*')[0])
        addDataPoint(voltage, current)
      }
      if(datasets[datasets.length - 1].data[0]!=null){
        if( datasets[datasets.length - 1].data[0].x.length == 1 ){
          if(!isDatasetSelected)
            handleSetIsDatasetSelected(true)
          handleSetDatasetSelected(datasets.length - 1)
        }
      }
    }

    // Data start
    else if(arduinoData.startsWith('$START')){
      setNewDataSet(currentName, currentParams)
      //console.log("Iniciado leitura de " + currentName)
    }
    
    // Data end
    else if(arduinoData.startsWith('$END')){
      const motive = arduinoData.split(',')
      //console.log("Finalizado por "+ motive[1])
      handleSetIsReading(false)
    }
  },[arduinoData])

  useEffect(()=>{
    setCurrentName(defaultName)
  },[defaultName])

  return (
    <DatasetsContext.Provider value={{ 
      currentName, handleCurrentName,
      currentParams, handleCurrentParams,
      isDatasetSelected, handleSetIsDatasetSelected,
      datasetSelected, handleSetDatasetSelected,
      handleDeleteDatasetSelected,
      datasets,
    }}>
      {children}
    </DatasetsContext.Provider>
  );
};

