import React from'react';
import './App.css';
//import GetPorts from './components/getPorts';
import { PortSelector } from './components/PortSelector';

function App() {
  return <div className='main'>
    <div className='serialPort'>
    <PortSelector/>
    </div>
  </div>
}

export default App;
