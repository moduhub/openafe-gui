import { Navigate, Routes, Route } from 'react-router-dom'

import { Dashboard } from '../pages';

export const AppRoutes=()=>{
  return(
    <Routes>
      <Route path="/pagina-inicial"  element={<Dashboard />} />

      {/* Se o usuário inserir um path inválido redireciona para o padrão */}
      <Route path='*' element={<Navigate to='/pagina-inicial'/>}/>
    </Routes>
  )
}