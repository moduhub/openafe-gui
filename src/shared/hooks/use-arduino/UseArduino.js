import { useState, useEffect } from 'react';

import { ReceivePorts } from '../../../arduino';

export const UseArduino = () => {
  const [arduinoData, setArduinoData] = useState('');
  const [ports, setPorts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [portSelected, setPortSelected] = useState('');
  
  useEffect(() => {
    ReceivePorts(setPorts)
    console.log("Atualizando")
  }, []);

  return { 
    arduinoData, setArduinoData,
    ports, setPorts,
    isConnected, setIsConnected,
    portSelected, setPortSelected 
  };
};
