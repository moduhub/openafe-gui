import React, { createContext, useCallback, useContext, useState } from 'react'

const SettingsContext = createContext({})

export const useSettingsContext = () => {
  return useContext(SettingsContext)
}

export const SettingsProvider = ({ children }) => {
  const [priorityMode, setPriorityMode] = useState(true)
  const [autoConnect, setAutoConnect] = useState(false)
  const [maxDatasets, setMaxDatasets] = useState(10)
  const [defaultName, setDefaultName] = useState('captura')
  const [deleteCache, setDeleteCache] = useState('Apagar dataset mais antigo')
  const [unitSystem, setUnitSystem] = useState('SI')
  const [tabIndex, setTabIndex] = useState(0)

  const handleSetPriorityMode = useCallback((newPiorityMode) => {
    setPriorityMode(newPiorityMode)
  }, [])
  const handleSetAutoConnect = useCallback((newAutoConnect) => {
    setAutoConnect(newAutoConnect)
  }, [])
  const handleSetMaxDatasets = useCallback((newMaxDatasets) => {
    setMaxDatasets(newMaxDatasets)
  }, [])
  const handleSetDefaultName = useCallback((newDefaultName) => {
    setDefaultName(newDefaultName)
  }, [])
  const handleSetDeleteCache = useCallback((newDeleteCache) => {
    setDeleteCache(newDeleteCache)
  }, [])
  const handleSetUnitSystem = useCallback((newUnitSystem) => {
    setUnitSystem(newUnitSystem)
  }, [])
  const handleSetTabIndex = useCallback((newTabIndex) => {
    setTabIndex(newTabIndex)
  }, [])

  return (
    <SettingsContext.Provider value={{
      priorityMode, handleSetPriorityMode,
      autoConnect, handleSetAutoConnect,
      maxDatasets, handleSetMaxDatasets,
      defaultName, handleSetDefaultName,
      deleteCache, handleSetDeleteCache,
      unitSystem, handleSetUnitSystem,
      tabIndex, handleSetTabIndex
    }}>
      {children}
    </SettingsContext.Provider>
  )
}