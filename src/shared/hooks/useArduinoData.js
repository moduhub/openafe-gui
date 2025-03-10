import { useState, useEffect } from 'react';
import { atualizarHooks } from '../components/arduino/ArduinoControle';

export const useArduinoData = () => {
  const [arduinoData, setArduinoData] = useState('');
  const [portas, setPortas] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [portaSelecionada, setPortaSelecionada] = useState('');

  useEffect(() => {
    atualizarHooks(setPortas, setArduinoData, setIsConnected, setPortaSelecionada);
  }, []);

  return { arduinoData, setArduinoData, portas, setPortas, isConnected, setIsConnected, portaSelecionada, setPortaSelecionada };
};