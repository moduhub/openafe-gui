import React, { useState, useEffect } from 'react';
import { TextField, Box, Button } from '@mui/material';

import { useArduinoData, useChart } from '../../hooks';

export const ChartComponent = () => {
  
  const { chartData, setChartData, clearChart, addDataToChart } = useChart();
  const { arduinoData, portas, setPortas, isConnected, portaSelecionada, setPortaSelecionada } = useArduinoData();

  useEffect(() => {
    const handleArduinoDataUpdate = () => {
      if (arduinoData.startsWith('$SGL')) {
        const dataParts = arduinoData.split(',');
        if (dataParts.length >= 3) {
          const voltage = parseFloat(dataParts[1]);
          const current = parseFloat(dataParts[2].split('*')[0]);
          addDataToChart(voltage, current);
        }
      }
    };
    handleArduinoDataUpdate();
  }, [arduinoData]);

  return (
    <Box sx={{ padding: 2 }}>
      <Box id="mychart" sx={{ height: 300, width: '100%' }}></Box>
    </Box>
  );
};