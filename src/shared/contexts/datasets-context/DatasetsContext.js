import React, { createContext, useCallback, useContext, useState, useEffect } from 'react'

import { 
  useArduinoContext, 
  ThemeContext, 
  useSettingsContext,
  useDashboardContext
} from '..'

const DatasetsContext = createContext({})

const defaultCVParams = {
  settlingTime: 1000,
  startPotential: -800,
  endPotential: 0,
  step: 10,
  scanRate: 1000,
  cycles: 1,
}

const defaultEISParams = {
  settlingTime: 1000,
  startOmega: 0, // Hz
  endOmega: 60, // Hz
  step: 1,
  scanRate: 60,
}

/**
 * Custom hook to access the Datasets context
 *
 * @returns {object} The datasets context value
 */
export const useDatasetsContext = () => {
  return useContext(DatasetsContext)
}

/**
 * Provides the Datasets context to its children
 * 
 * Manages the creation, deletion, visibility, and parameter settings
 * of datasets based on Arduino data and application settings
 * Also reacts to serial data events like $START, $SGL, and $END
 * 
 * @param {React.ReactNode} children - React children components.
 * 
 * @returns {JSX.Element} 
 */
export const DataSetsProvider = ({ children }) => {

  const { theme } = useContext(ThemeContext)

  const { 
    arduinoData,
    handleSetIsReading ,
  } = useArduinoContext()
  const {
    priorityMode,
    maxDatasets,
    defaultName,
  } = useSettingsContext()
  const { 
    tabDatasetsIsMinimized: isDatasetsMinimized, 
    handleToggleTabDatasetsMinimized: setIsDatasetsMinimized,
  } = useDashboardContext()

  const [currentName, setCurrentName] = useState(defaultName)
  const [experimentType, setExperimentType] = useState('CV') // ou 'EIS'
  const [currentParams, setCurrentParams] = useState(defaultCVParams)
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
    if(datasets.length === 1){
      //console.log("Acabou ou datasets")
      handleSetDatasetSelected("")
      handleSetIsDatasetSelected(false)
    }
  }
  
  const handleDeleteDataset = (pos) => {
    handleSetDatasetSelected(0)
    const newDataSets = [...datasets]
    newDataSets.splice(pos, 1)
    handleSetDataset(newDataSets)
    if(datasets.length === 1){
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

  const setNewDataSet = (name_, parameters_, type_) => {
    const visible_ = true
  
    const handleSetIsVisible = () => {
      setDatasets((prevDatasets) =>
        prevDatasets.map((dataset) =>
          dataset.name === name_
            ? { ...dataset, visible: !dataset.visible }
            : dataset
        )
      )
    }
  
    const addInterpolation = (interpolation) => {
      setDatasets((prevDatasets) =>
        prevDatasets.map((dataset) =>
          dataset.name === name_
            ? {
                ...dataset,
                interpolations: [...dataset.interpolations, interpolation],
              }
            : dataset
        )
      )
    }

    const addAreaMarker = (area) => {
      setDatasets((prevDatasets) =>
        prevDatasets.map((dataset) =>
          dataset.name === name_
            ? {
                ...dataset,
                areas: [...dataset.areas, area],
              }
            : dataset
        )
      )
    }

    const addPointMarker = (marker) =>{
      setDatasets((prevDatasets) =>
        prevDatasets.map((dataset) =>
          dataset.name === name_
            ? {
                ...dataset,
                markers: [...dataset.markers, marker],
              }
            : dataset
        )
      )
      console.log("marcação adicionada com sucesso")
      console.log(marker)
    }
    
    let data_ = []
    if(type_ === "CVW")
      data_ = [{
            x: [], y: [],
            mode: 'lines',
            line: { color: theme.palette.primary.main },
            name: toString(name_),
          }]
    else if (type_ === "IES")
      data_ = [{
            omega: [], modZ: [], angZ: [], realZ: [], imagZ: [],
            mode: 'lines',
            line: { color: theme.palette.primary.main },
            name: toString(name_),
          }]
  
    cacheDatasetsManager()
    setDatasets((prevDatasets) => [
      ...prevDatasets,
      {
        name: name_,
        type: type_,
        params: parameters_,
        visible: visible_,
        setIsVisible: handleSetIsVisible,
        addInterpolation: addInterpolation,
        addAreaMarker: addAreaMarker,
        addPointMarker: addPointMarker,
        interpolations: [],
        areas: [],
        markers: [],
        data: data_,
      },
    ])

  }

  const handleNewDataset = (name_, parameters_, points_) => {
    const visible_ = true
    const handleSetIsVisible = () => {
      setDatasets((prevDatasets) =>
        prevDatasets.map((dataset) =>
          dataset.name === name_
            ? { ...dataset, visible: !dataset.visible }
            : dataset
        )
      )
    }

    cacheDatasetsManager()
    setDatasets((prevDatasets) => [
      ...prevDatasets,
      {
        name: name_,
        params: parameters_,
        visible: visible_,
        setIsVisible: handleSetIsVisible,
        data: [
          {
            x: points_.x,
            y: points_.y,
            mode: 'lines',
            line: { color: theme.palette.primary.main },
          },
        ],
      },
    ])
  }

  const addDataPoint = (voltage, current) => {
    setDatasets((prevDatasets) => {
      const updatedDatasets = prevDatasets.map((dataset, index) => {
        if (index === prevDatasets.length - 1) {
          const newData = dataset.data ? [...dataset.data] : []
          if (!newData[0]) newData[0] = { x: [], y: [] }
  
          return {
            ...dataset,
            data: [
              {
                ...newData[0],
                x: [...newData[0].x, voltage],
                y: [...newData[0].y, current],
              },
            ],
          }
        }
        return dataset
      })
  
      return updatedDatasets
    })
  }

  const addComplexPoint = (omega_, modZ_, angZ_, realZ_, imagZ_) => {
    setDatasets((prevDatasets) => {
      const updatedDatasets = prevDatasets.map((dataset, index) => {
        if (index === prevDatasets.length - 1) {
          const newData = dataset.data ? [...dataset.data] : []
          if (!newData[0]) newData[0] = { omega: [], modZ: [], angZ: [], realZ: [], imagZ: [] }
  
          return {
            ...dataset,
            data: [
              {
                ...newData[0],
                omega: [...newData[0].omega, omega_],
                modZ: [...newData[0].modZ, modZ_],
                angZ: [...newData[0].angZ, angZ_],
                realZ: [...newData[0].realZ, realZ_],
                imagZ: [...newData[0].imagZ, imagZ_],
              },
            ],
          }
        }
        return dataset
      })
  
      return updatedDatasets
    })
  }

  const toggleDatasetVisibility = useCallback((pos) => {
    datasets[pos].setIsVisible(!datasets[pos].visible)
  })

  const showOnlyDataset = useCallback((pos) => {
    datasets.forEach( (ds, i) => 
      i === pos ? 
        !ds.visible && ds.setIsVisible() : ds.visible && ds.setIsVisible()
    )
  })

  const addDatasetParam = (datasetName, paramName, paramValue) => {
    setDatasets((prevDatasets) =>
      prevDatasets.map((dataset) =>
        dataset.name === datasetName
          ? {
              ...dataset,
              params: {
                ...dataset.params,
                [paramName]: paramValue,
              },
            }
          : dataset
      )
    )
  }

  const handleExperimentType = useCallback((type) => {
    setExperimentType(type)
    setCurrentParams(type === 'CV' ? defaultCVParams : defaultEISParams)
  }, [])
  
  useEffect(()=>{

    //console.log(arduinoData)
      
    // Data graph
    if (arduinoData.startsWith('$SGL')) {
      const dataParts = arduinoData.split(',')
      if (dataParts.length >= 3) {
        const voltage = parseFloat(dataParts[1])
        const current = parseFloat(dataParts[2].split('*')[0])
        addDataPoint(voltage, current)
      }
      if(datasets[datasets.length - 1].data[0]!=null){
        if( datasets[datasets.length - 1].data[0].x.length === 1 ){
          if(!isDatasetSelected)
            handleSetIsDatasetSelected(true)
          handleSetDatasetSelected(datasets.length - 1)
          if (priorityMode) 
            showOnlyDataset(datasets.length - 1)
        }
      }
    }
    else if (arduinoData.startsWith('$EIS-OUT')) {
      const dataParts = arduinoData.split(',')
      

      if(dataParts.length >= 6){
        //console.log(dataParts)
        const omega = parseFloat(dataParts[1])
        const modZ = parseFloat(dataParts[2])
        const angZ = parseFloat(dataParts[3])
        const realZ = parseFloat(dataParts[4])
        const imagZ = parseFloat(dataParts[5])
        addComplexPoint(omega, modZ, angZ, realZ, imagZ)
      }

      //console.log(datasets)
      /*
      if(datasets[datasets.length - 1].data[0]!=null){
        if( datasets[datasets.length - 1].data[0].omega.length === 1 ){
          if(!isDatasetSelected)
            handleSetIsDatasetSelected(true)
          handleSetDatasetSelected(datasets.length - 1)
          if (priorityMode) 
            showOnlyDataset(datasets.length - 1)
        }
      }*/
    }

    // Data start
    else if(arduinoData.startsWith('$START')){
      if(arduinoData.startsWith('$START-CVW'))
        setNewDataSet(currentName, currentParams, "CVW")
      else if(arduinoData.startsWith('$START-IES'))
        setNewDataSet(currentName, currentParams, "IES")
    }
    
    // Data end
    else if(arduinoData.startsWith('$END')){
      //const motive = arduinoData.split(',')
      //console.log("Finalizado por "+ motive[1])
      handleSetIsReading(false)
      if(isDatasetsMinimized)
        setIsDatasetsMinimized()
    }
  },[arduinoData])

  useEffect(()=>{
    setCurrentName(defaultName)
  },[defaultName])

  return (
    <DatasetsContext.Provider value={{ 
      currentName, handleCurrentName,
      experimentType, handleExperimentType,
      currentParams, handleCurrentParams,
      isDatasetSelected, handleSetIsDatasetSelected,
      datasetSelected, handleSetDatasetSelected,
      handleDeleteDatasetSelected,
      handleDeleteDataset,
      //handleDatasetIsVisible,
      datasets, handleSetDataset,
      handleNewDataset,
      toggleDatasetVisibility,
      showOnlyDataset,
      addDatasetParam,
    }}>
      {children}
    </DatasetsContext.Provider>
  )
}