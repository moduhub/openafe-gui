import { Navigate, Routes, Route } from 'react-router-dom'

import { Dashboard, DataProcessing, Settings } from '../pages';

export const AppRoutes=()=>{
  return(
    <Routes>
      <Route path="/home"  element={<Dashboard />} />
      <Route path="/data-processing" element={<DataProcessing />} />
      <Route path="/settings" element={<Settings />} />

      {/* Se o usuário inserir um path inválido redireciona para o padrão */}
      <Route path='*' element={<Navigate to='/home'/>}/>
    </Routes>
  )
}