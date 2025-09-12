import React, { createContext, useCallback, useContext, useState, useEffect } from 'react'

import { 
  useArduinoContext, 
  useSettingsContext,
  useDashboardContext
} from '..'

import { calculateChecksum } from '../../math-functions'
import { FinishReading } from '../../../arduino'

const DatasetsContext = createContext({})

const defaultCVParams = {
  settlingTime: 1000,
  startingPotential: -800,
  endingPotential: 0,
  scanRate: 1000,
  stepPotential: 100,
  cycles: 1,
}

const defaultDPVParams = {
  settlingTime: 1000,
  startingPotential: -500,
  endingPotential: 500,
  scanRate: 1000,
  stepPotential: 100,
  pulsePotential: 50,
  dutyCycle: 10
}

const defaultSWVParams = {
  settlingTime: 1000,
  startingPotential: -500,
  endingPotential: 500,
  scanRate: 1000,
  stepPotential: 100,
  pulsePotential: 50,
  dutyCycle: 50
}

const defaultEISParams = {
  settlingTime: 1000,
  startOmega: 0, // Hz
  endOmega: 100, // Hz
  stepForADecade: 10,
  scanRate: 5000,
}

/**
 * @brief Custom hook to access the Datasets context
 *
 * @returns {object} The datasets context value
 * 
 * Behavior:
 * - Provides access to dataset management functions and state
 */
export const useDatasetsContext = () => {
  return useContext(DatasetsContext)
}

/**
 * @brief Provides the Datasets context to its children
 * 
 * Manages the creation, deletion, visibility, and parameter settings
 * of datasets based on Arduino data and application settings
 * Also reacts to serial data events like $START, $SGL, and $END
 * 
 * @param {React.ReactNode} children - React children components.
 * 
 * Behavior:
 * - Initializes state for datasets and related parameters
 * - Provides functions to manipulate datasets (add, delete, toggle visibility)
 * - Listens to Arduino data updates to manage datasets in real-time
 */
export const DataSetsProvider = ({ children }) => {

  const { 
    arduinoData, clearArduinoData,
    handleSetIsReading,
    isDummy,
    handleSetPortConnected, 
    handleSetIsConnecting, handleSetIsConnect,
    portSelected,
    setSnackbar, isConnected
  } = useArduinoContext()
  const {
    priorityMode,
    maxDatasets,
    defaultName,
  } = useSettingsContext()
  const { 
    tabDatasetsIsMinimized: isDatasetsMinimized, 
    handleToggleTabDatasetsMinimized: setIsDatasetsMinimized,
    tabArduinoIsMinimized: isArduinoMinimized, 
    handleToggleTabArduinoMinimized: setIsArduinoMinimized,
  } = useDashboardContext()

  const [currentName, setCurrentName] = useState(defaultName)
  const [experimentType, setExperimentType] = useState('CVW') // or  'DPV', SWV, 'EIS'
  const [currentParams, setCurrentParams] = useState(defaultCVParams)
  const [datasets, setDatasets]= useState([])
  const [isDatasetSelected, setIsDatasetSelected] = useState(false)
  const [datasetSelected, setDatasetSelected] = useState("")
  const [pendingReset, setpendingReset] = useState(false)
  
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
    // Before adding, hide all datasets of a different type
    setDatasets((prevDatasets) =>
      prevDatasets.map((dataset) =>
        dataset.type !== type_ && (dataset.type === "CVW" || dataset.type === "DPV" || dataset.type === "SWV" || dataset.type === "EIS")
          ? { ...dataset, visible: false }
          : dataset
      )
    )

    const visible_ = true
  
    // Function to toggle visibility ensuring exclusivity by type
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
    }
    
    let data_ = []
    if(type_ === "CVW" || type_ === "DPV" || type_ === "SWV")
      data_ = [{
            x: [], y: [],
            mode: 'lines',
            line: null,
            name: name_,
          }]
    else if (type_ === "EIS")
      data_ = [{
            omega: [], modZ: [], angZ: [], realZ: [], imagZ: [],
            mode: 'lines',
            line: null,
            name: name_,
          }]
  
    cacheDatasetsManager()

    setDatasets((prevDatasets) => [
      ...prevDatasets,
      {
        name: name_,
        type: type_,
        params: parameters_,
        params_e: [],
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

  const handleNewDataset = (name_, parameters_, points_, type_) => {
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
    }

    cacheDatasetsManager()

    let data_ = []
    if(type_ === "CVW")
      data_ = [{
            x: points_.x, y: points_.y,
            mode: 'lines',
            line: null,
            name: name_,
          }]
    else if (type_ === "EIS")
      data_ = [{
            omega: points_.omega, modZ: points_.modZ, angZ: points_.angZ, realZ: points_.realZ, imagZ: points_.imagZ,
            mode: 'lines',
            line: null,
            name: name_,
          }]
    
    setDatasets((prevDatasets) => [
      ...prevDatasets,
      {
        name: name_,
        type: type_,
        params: parameters_,
        params_e: [],
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
  
  const addComplexPoint = (omega_, realZ_, imagZ_) => {

    const modZ_ = Math.sqrt(realZ_ * realZ_ + imagZ_ * imagZ_)
    const angZ_ = Math.atan2(imagZ_, realZ_) * (180 / Math.PI) // in degree

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

  const handleExperimentType = useCallback((type) => {
    setExperimentType(type)
    switch (type) {
      case 'CVW':
        setCurrentParams(defaultCVParams)
        break
      case 'DPV':
        setCurrentParams(defaultDPVParams)
        break
       case 'SWV':
        setCurrentParams(defaultSWVParams)
        break
      case 'EIS':
        setCurrentParams(defaultEISParams)
        break
      default:
        setCurrentParams(defaultCVParams)
        break
    }
  }, [])

  const toggleDatasetVisibility = useCallback((pos) => {
    setDatasets(prevDatasets => {
      const target = prevDatasets[pos]
      if (!target) return prevDatasets

      handleExperimentType(target.type)

      return prevDatasets.map((ds, idx) => {
        if (idx === pos) {
          return { ...ds, visible: !ds.visible }
        }
        if (!target.visible && ds.type !== target.type && (ds.type === 'CVW' || ds.type === 'EIS')) {
          return { ...ds, visible: false }
        }
        return ds
      })
    })
  }, [handleExperimentType])

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
              params_e: {
                ...dataset.params_e,
                [paramName]: paramValue,
              },
            }
          : dataset
      )
    )
  }

  const editDatasetParam = (datasetName, paramName, paramValue) => {
    setDatasets((prevDatasets) =>
      prevDatasets.map((dataset) =>
        dataset.name === datasetName
          ? {
              ...dataset,
              params_e: {
                ...dataset.params_e,
                [paramName]: paramValue,
              },
            }
          : dataset
      )
    )
  }

  const deleteDatasetParam = (datasetName, paramName) => {
    setDatasets((prevDatasets) =>
      prevDatasets.map((dataset) =>
        dataset.name === datasetName
          ? {
              ...dataset,
              params_e: Object.fromEntries(
                Object.entries(dataset.params_e).filter(([key]) => key !== paramName)
              ),
            }
          : dataset
      )
    )
  }

  const setExclusiveVisibility = useCallback((typeToShow) => {
    setDatasets((prevDatasets) =>
      prevDatasets.map((dataset) => {
        if (dataset.type === typeToShow) {
          return { ...dataset, visible: true }
        } else if (dataset.type === "CVW" || dataset.type === "EIS") {
          return { ...dataset, visible: false }
        }
        return dataset
      })
    )
  }, [])

  const toggleExclusiveVisibility = useCallback((pos) => {
    setDatasets((prevDatasets) => {
      const target = prevDatasets[pos]
      if (!target) return prevDatasets
      const typeToShow = target.type
      return prevDatasets.map((dataset, idx) => {
        if (idx === pos) {
          return { ...dataset, visible: !dataset.visible }
        } else if (dataset.type === "CVW" || dataset.type === "EIS") {
          return typeToShow !== dataset.type ? { ...dataset, visible: false } : dataset
        }
        return dataset
      })
    })
  }, [])

  useEffect(() => {
    if (!arduinoData.length) return

    arduinoData.forEach((msg,i) => {
      if(!isDummy){

        // Get Point
        if (msg.startsWith('SGL')) {
          const dataParts = msg.split(',')
          const voltage = parseFloat(dataParts[1])
          const current = parseFloat(dataParts[2])
          addDataPoint(voltage, current)
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

        // COMM
        else if (msg.startsWith('MSG,RDY')){ 
          handleSetPortConnected(portSelected)
          handleSetIsConnecting(false)
          handleSetIsReading(false)
          if(!isConnected){
            setSnackbar({ open: false, message: '', severity: 'info' }) 
            setSnackbar({ open: true, message: 'Successfully connected to the port '+portSelected+'!', severity: 'success' }) 
            handleSetIsConnect(true)
          }
          else {
            setSnackbar({ open: false, message: '', severity: 'info' }) 
          }
          if(isArduinoMinimized) setIsArduinoMinimized()
        } 

        // Data start
        else if (msg.startsWith('MSG,CUR,UPDT')){ 
          const CP = Object.values(currentParams) 
          const commandBody = `$${experimentType},${CP.join(",")}*`
          const checksum = calculateChecksum(commandBody)
          window.electron.sendCommand(`${commandBody}${checksum}`)
        }

        // Voltammetry start
        else if (msg.startsWith('MSG,CVS')) { 
          handleSetIsReading(true)
          setNewDataSet(currentName, currentParams, experimentType)
        }
        
        // Data end
        else if(msg.startsWith('MSG,END')){
          handleSetIsReading(false)
          if(isDatasetsMinimized) setIsDatasetsMinimized()
          setpendingReset(true)
        }
      }
      
      // Data graph Dummy
      else {
        if(msg.startsWith('CNT')){
          handleSetPortConnected(portSelected)
          handleSetIsConnecting(false)
          handleSetIsConnect(true)
          setSnackbar({ open: false, message: '', severity: 'info' }) 
          setSnackbar({ open: true, message: 'Successfully connected to the port '+portSelected+'!', severity: 'success' })
          if(isArduinoMinimized) setIsArduinoMinimized()
        }
        else if (msg.startsWith('SGL')) {
          const dataParts = msg.split(',')
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
        else if (msg.startsWith('EOT')) {
          const dataParts = msg.split(',')
          if(dataParts.length >= 4){
            const omega = parseFloat(dataParts[1])
            const realZ = parseFloat(dataParts[2])
            const imagZ = parseFloat(dataParts[3])
            addComplexPoint(omega, realZ, imagZ)
          }
        }
        // Data start
        else if(msg.startsWith('VS'))
          setNewDataSet(currentName, currentParams, "CVW")
        else if(msg.startsWith('ESS'))
          setNewDataSet(currentName, currentParams, "EIS")
        
        // Data end
        else if(msg.startsWith('END') || msg.startsWith('$EBF')){
          handleSetIsReading(false)
          if(isDatasetsMinimized)
            setIsDatasetsMinimized()
          setpendingReset(true)
        }
      }

    })
    clearArduinoData()
  }, [arduinoData])

  useEffect(()=>{
    setCurrentName(defaultName)
  },[defaultName])

  useEffect(()=> {
    if (pendingReset){
      setpendingReset(false)
      setSnackbar({ open: true, message: 'Restarting Arduino...', severity: 'info' })
      setTimeout(() => {FinishReading()}, 50)
    }
  }, [pendingReset])


  return (
    <DatasetsContext.Provider value={{ 
      currentName, handleCurrentName,
      experimentType, handleExperimentType,
      currentParams, handleCurrentParams,
      isDatasetSelected, handleSetIsDatasetSelected,
      datasetSelected, handleSetDatasetSelected,
      handleDeleteDatasetSelected,
      handleDeleteDataset,
      datasets, handleSetDataset,
      handleNewDataset,
      toggleDatasetVisibility,
      showOnlyDataset,
      addDatasetParam, editDatasetParam, deleteDatasetParam,
      setExclusiveVisibility, toggleExclusiveVisibility,
    }}>
      {children}
    </DatasetsContext.Provider>
  )
}