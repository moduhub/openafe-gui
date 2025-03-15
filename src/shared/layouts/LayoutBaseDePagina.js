import { TextField, Box, Card, CardContent, List, ListItem } from '@mui/material';
import { Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import MinimizeIcon from '@mui/icons-material/Minimize';
import MaximizeIcon from '@mui/icons-material/Maximize';

import { iniciarLeitura, finalizarLeitura } from '../components/arduino/ArduinoControle';
import { ChartComponent } from '../components/grafico/Grafico';
import { useState } from 'react';

export const LayoutBaseDePagina = ({ children }) => {
  const theme = useTheme();

  const [settlingTime, setSettlingTime] = useState(1000);
  const [startPotential, setStartPotential] = useState(-800);
  const [endPotential, setEndPotential] = useState(0);
  const [step, setStep] = useState(100);
  const [scanRate, setScanRate] = useState(2);
  const [cycles, setCycles] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false); 

  const handleIniciarLeitura = () => {
    // Função de verificação
    const fields = [
      { value: settlingTime, label: 'Settling Time (ms)' },
      { value: step, label: 'Step (mV)' },
      { value: scanRate, label: 'Scan Rate (mV/s)' },
      { value: cycles, label: 'Cycles' }
    ];

    for (const field of fields) {
      if (!Number.isInteger(field.value) || field.value <= 0) {
        setErrorMessage(`${field.label} deve ser um número inteiro maior que zero.`);
        return; // Não executar iniciarLeitura caso algum campo seja inválido
      }
    }

    // Não há validação para startPotential e endPotential quanto a valores negativos
    if (!Number.isInteger(startPotential)) {
      setErrorMessage('Start Potential deve ser um número inteiro.');
      return;
    }
    if (!Number.isInteger(endPotential)) {
      setErrorMessage('End Potential deve ser um número inteiro.');
      return;
    }

    setErrorMessage(''); // Limpar mensagem de erro se tudo estiver correto
    iniciarLeitura("$CVW",settlingTime,startPotential,endPotential,step,scanRate,cycles); // Executar a função se tudo estiver correto
  };

  return (
    <Box height="100%" width="100%" display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
      
      {/* Menu lateral */}
      <Box 
        width={isMinimized ? theme.spacing(12) : theme.spacing(40)}  
        height={isMinimized ? "80%" : null}  
        display="flex"     
        flexShrink="0"
        marginTop={isMinimized?null:theme.spacing(2)}  
        marginBottom={isMinimized?null:theme.spacing(2)}
        transition="width 0.3s ease"
        alignItems="start"
        position={isMinimized?"absolute":null}
        top={isMinimized?theme.spacing(12):null}
      >
        <Card sx={{ borderRadius: '16px'}}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column'}}>
            
            {/* Botão de minimização */}
            <Box display="flex" justifyContent="end" flexDirection="row" width="100%">
              <Button onClick={() => setIsMinimized(!isMinimized)} 
                variant="outlined" 
                width={theme.spacing(4)}
                size="small"
              >
                {isMinimized ? <MaximizeIcon /> : <MinimizeIcon />}
              </Button>
            </Box>
            

            {isMinimized && (
              <Box minHeight="100%"></Box>
            )}

            {/* Exibir mensagem de erro caso algum campo esteja incorreto */}
            {errorMessage && !isMinimized &&(
              <Typography color="error" variant="body2">
                {errorMessage}
              </Typography>
            )}

            {!isMinimized && (
              <List>
                <ListItem>
                  <TextField
                    label="Settling Time (ms)"
                    value={settlingTime}
                    onChange={(e) => setSettlingTime(Number(e.target.value))}
                    type="number"
                    fullWidth
                  />
                </ListItem>
                <ListItem>
                  <TextField
                    label="Start Potential (mV)"
                    value={startPotential}
                    onChange={(e) => setStartPotential(Number(e.target.value))}
                    type="number"
                    fullWidth
                  />
                </ListItem>
                <ListItem>
                  <TextField
                    label="End Potential (mV)"
                    value={endPotential}
                    onChange={(e) => setEndPotential(Number(e.target.value))}
                    type="number"
                    fullWidth
                  />
                </ListItem>
                <ListItem>
                  <TextField
                    label="Step (mV)"
                    value={step}
                    onChange={(e) => setStep(Number(e.target.value))}
                    type="number"
                    fullWidth
                  />
                </ListItem>
                <ListItem>
                  <TextField
                    label="Scan Rate (mV/s)"
                    value={scanRate}
                    onChange={(e) => setScanRate(Number(e.target.value))}
                    type="number"
                    fullWidth
                  />
                </ListItem>
                <ListItem>
                  <TextField
                    label="Cycles"
                    value={cycles}
                    onChange={(e) => setCycles(Number(e.target.value))}
                    type="number"
                    fullWidth
                  />
                </ListItem>
              </List>
            )}

            {!isMinimized && (
              <Box width="100%" display="flex" justifyContent="center" gap={theme.spacing(3)}>
                <Button onClick={handleIniciarLeitura} variant="outlined"><PlayArrowIcon /></Button>
                <Button onClick={finalizarLeitura} variant="outlined"><StopIcon /></Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Gráfico */}
      <Box>
        <ChartComponent />
      </Box>

      {/* Controle de Datasheets */}
      <Box width={theme.spacing(28)} maxWidth="25%"></Box>
    </Box>
  );
};
