import { useState, useEffect } from 'react';

import { UseArduino } from '..';

export const useDatasets = () => {

  const { arduinoData, portas, setPortas, isConnected, portaSelecionada, setPortaSelecionada } = UseArduino();

  const [points, setPoints] = useState([{
    x: [],
    y: [],
    mode: 'lines',
  }]);

  const addDataToDataset = (x, y) => {
    setPoints(prevData => {
      const newData = { ...prevData[0] };
      newData.x.push(x);
      newData.y.push(y);
      return [newData];
    });
  };

  useEffect(() => {
    console.log("Atualizado o arduino data")
    const handleArduinoDataUpdate = () => {
      if (arduinoData.startsWith('$SGL')) {
        const dataParts = arduinoData.split(',');
        if (dataParts.length >= 3) {
          const voltage = parseFloat(dataParts[1]);
          const current = parseFloat(dataParts[2].split('*')[0]);
          addDataToDataset(voltage, current);
        }
      }
    };
    handleArduinoDataUpdate();
  }, [arduinoData]);

  return { points };
};