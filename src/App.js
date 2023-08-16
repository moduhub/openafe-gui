import React from'react';
import './App.css';
import GetPorts from './components/getPorts';

function App() {
  return <div className='main'>
    <div className='serialPort'>
    <GetPorts />
    </div>
  </div>
}

export default App;
