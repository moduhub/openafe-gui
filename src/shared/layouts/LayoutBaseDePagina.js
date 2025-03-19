import { TextField, Box, Card, CardContent, List, ListItem } from '@mui/material';
import { Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import MinimizeIcon from '@mui/icons-material/Minimize';
import MaximizeIcon from '@mui/icons-material/Maximize';
import IconButton from '@mui/material/IconButton';

import { iniciarLeitura, finalizarLeitura } from '../components/arduino/ArduinoControle';
import { ChartComponent } from '../components/grafico/Grafico';
import { useState,useEffect } from 'react';

export const LayoutBaseDePagina = ({ children }) => {
  const theme = useTheme();

  const [params, setParams] = useState({
    settlingTime: 1000,
    startPotential: -800,
    endPotential: 0,
    step: 100,
    scanRate: 2,
    cycles: 1
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  // Can be 'small' or 'larger'
  const [graphWidth, setGraphWidth] = useState('100%');
  const [name, setName] = useState(''); 

  // Novo estado de erros para os campos
  const [errors, setErrors] = useState({
    settlingTime: '',
    startPotential: '',
    endPotential: '',
    step: '',
    scanRate: '',
    cycles: '',
  });

  const handleChange = (field) => (e) => {
    setParams(prevState => ({
      ...prevState,
      [field]: Number(e.target.value)
    }));

    // Limpa o erro relacionado ao campo quando o usuário edita
    setErrors(prevErrors => ({
      ...prevErrors,
      [field]: ''
    }));
  };

  const handleIniciarLeitura = () => {
    const newErrors = {};

    // Valida todos os campos e acumula erros
    if (!Number.isInteger(params.settlingTime) || params.settlingTime <= 0) {
      newErrors.settlingTime = 'Incorrect entry.';
    }
    if (!Number.isInteger(params.step) || params.step <= 0) {
      newErrors.step = 'Incorrect entry.';
    }
    if (!Number.isInteger(params.scanRate) || params.scanRate <= 0) {
      newErrors.scanRate = 'Incorrect entry.';
    }
    if (!Number.isInteger(params.cycles) || params.cycles <= 0) {
      newErrors.cycles = 'Incorrect entry.';
    }
    if (!Number.isInteger(params.startPotential)) {
      newErrors.startPotential = 'Incorrect entry.';
    }
    if (!Number.isInteger(params.endPotential)) {
      newErrors.endPotential = 'Incorrect entry.';
    }

    // Se houver erros, não prosseguir
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Se não houver erros, limpa as mensagens de erro e continua
    setErrors({});
    setErrorMessage('');
    iniciarLeitura("$CVW", params.settlingTime, params.startPotential, params.endPotential, params.step, params.scanRate, params.cycles);
  };

  useEffect(() => {
    setGraphWidth('100%');
  }, [isMinimized]);

  return (
    <Box height="100%" width="100%" display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
      
      {/* Menu lateral */}
      <Box 
        width={isMinimized ? theme.spacing(12) : theme.spacing(35)}  
        height={isMinimized ? "80%" : null}  
        display="flex"     
        flexShrink="0"
        marginTop={isMinimized ? null : theme.spacing(2)}  
        marginBottom={isMinimized ? null : theme.spacing(2)}
        transition="width 0.3s ease"
        alignItems="start"
        //position={isMinimized ? "absolute" : "relative"}
        top={isMinimized ? theme.spacing(12) : null}
      >
        <Card sx={{ borderRadius: '16px' }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            
            {/* Botão de minimização */}
            <Box display="flex" justifyContent="end" flexDirection="row" width="100%">
              <IconButton aria-label="delete" size="small" onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? <MaximizeIcon /> : <MinimizeIcon />}
              </IconButton>
            </Box>

            {isMinimized && <Box minHeight="100%"></Box>}

            {/* Exibir mensagem de erro geral */}
            {errorMessage && !isMinimized && (
              <Typography color="error" variant="body2">
                {errorMessage}
              </Typography>
            )}

            {/* Campos de entrada */}
            {!isMinimized && (
              <List>
                <ListItem>
                  <TextField
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    size="small"
                    fullWidth
                    error={!!errors.name}  // Exibe erro no campo name (caso tenha)
                    helperText={errors.name}  // Mostra a mensagem de erro
                  />
                </ListItem>
                {['settlingTime', 'startPotential', 'endPotential', 'step', 'scanRate', 'cycles'].map((field) => (
                  <ListItem key={field}>
                    <TextField
                      label={`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} (ms)`}
                      value={params[field]}
                      onChange={handleChange(field)}
                      type="number"
                      size="small"
                      fullWidth
                      error={!!errors[field]}  // Verifica se há erro para o campo específico
                      helperText={errors[field]}  // Exibe a mensagem de erro
                    />
                  </ListItem>
                ))}
              </List>
            )}

            {/* Botões de controle */}
            {!isMinimized && (
              <Box width="100%" display="flex" justifyContent="center" gap={theme.spacing(3)}>
                <Button onClick={handleIniciarLeitura} variant="contained" color="success" size="small"><PlayArrowIcon /></Button>
                <Button onClick={finalizarLeitura} variant="contained" color="error" size="small"><StopIcon /></Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Gráfico */}
      <Box width={graphWidth} height="100%">
        <ChartComponent/>
      </Box>

      {/* Controle de Datasets */}
      <Box 
        width={isMinimized ? theme.spacing(12) : theme.spacing(35)}  
        height={isMinimized ? "80%" : null}  
        display="flex"     
        flexShrink="0"
        marginTop={isMinimized ? null : theme.spacing(2)}  
        marginBottom={isMinimized ? null : theme.spacing(2)}
        transition="width 0.3s ease"
        alignItems="start"
        justifyContent="end"
        top={isMinimized ? theme.spacing(12) : null}
      >
        <Card sx={{ borderRadius: '16px' }}>
          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            
            {/* Botão de minimização */}
            <Box display="flex" justifyContent="end" flexDirection="row" width="100%">
              <Button
                variant="outlined" 
                width={theme.spacing(4)}
                size="small"
              >
                {isMinimized ? <MaximizeIcon /> : <MinimizeIcon />}
              </Button>
            </Box>

            {isMinimized && <Box minHeight="100%"></Box>}

            {/* Campos de entrada */}

            {/* Botões de controle */}
          </CardContent>
        </Card>
      </Box>
          
    </Box>
  );
};
