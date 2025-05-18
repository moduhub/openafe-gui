import { Navigate, Routes, Route } from 'react-router-dom'

import { Dashboard, DataProcessing, Settings, Filters } from '../pages'

/**
 * Defines the routing structure for the application
 * 
 * Routes:
 *  - "/home"            : Dashboard component
 *  - "/data-processing" : DataProcessing component
 *  - "/settings"        : Settings component
 *  - "/filters"         : Filters component
 * 
 * Includes a catch-all route that redirects any unknown paths to "/home"
 */
export const AppRoutes = () => {
  return(
    <Routes>
      <Route path="/home"  element={<Dashboard />} />
      <Route path="/data-processing" element={<DataProcessing />} />
      <Route path="/settings" element={<Settings />} />
      
      <Route path="/filters" element={<Filters />} />

      {/* If the user enters an invalid path, it redirects to the default */}
      <Route path='*' element={<Navigate to='/home'/>}/>
    </Routes>
  )
}