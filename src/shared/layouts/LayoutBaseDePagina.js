import { useState } from 'react';
import { Box } from '@mui/system';
import { Button, Divider, Typography } from '@mui/material';

//import { useEffect } from 'react';
//import { useArduinoData } from '../hooks';

import { iniciarLeitura, finalizarLeitura } from '../components/arduino/ArduinoControle';
import { ChartComponent } from '../components/grafico/Grafico';
import { useChart } from '../hooks'

export const LayoutBaseDePagina = ({ children, titulo }) => {

  const { chartData, setChartData, clearChart, addDataToChart } = useChart();

  return (
    <Box height="100%" width="100%" display="flex" flexDirection="column" gap={1}>
      
      <Button onClick={iniciarLeitura} >Iniciar Leitura</Button>
      <Button onClick={finalizarLeitura} >Parar Leitura</Button>
      <Button onClick={()=>clearChart(setChartData)}>Limpar Gráfico</Button>

      <Divider />
      

      <ChartComponent />

    </Box>
  )
}