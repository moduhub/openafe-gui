import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  Container,
  FormControl,
  Divider,
} from '@mui/material';

import { useAppThemeContext, useSettingsContext } from '../../shared/contexts';

export const Settings = () => {
  const { toggleTheme, themeName } = useAppThemeContext();
  const {
    priorityMode, handleSetPriorityMode,
    autoConnect, handleSetAutoConnect,
    maxDatasets, handleSetMaxDatasets,
    defaultName, handleSetDefaultName,
    deleteCache, handleSetDeleteCache,
    unitSystem, handleSetUnitSystem,
    tabIndex, handleSetTabIndex
  } = useSettingsContext();

  const languageOptions = ['Ingles (instável)']
  const displayOptions= ['Exibir todos', 'Pular 2 em 2', 'Pular 5 em 5', 'Pular 10 em 10'];
  const deleteCacheOptions = ['Apagar dataset mais antigo']
  const unitOptions = ['SI'];

  return (
    <Container maxWidth="sm" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ width: '100%', p: 2 }}>
        <Tabs value={tabIndex} onChange={(_, newIndex) => handleSetTabIndex(newIndex)} variant="fullWidth">
          <Tab label="Geral" />
          <Tab label="Dados" />
        </Tabs>
        {tabIndex === 0 && (
          <Box padding={4}>
            <Typography variant="h5" gutterBottom>
              Configurações Gerais
            </Typography>
            <Box marginBottom={2} marginTop={2}><Divider/></Box>
            <FormControlLabel margin="dense"
              control={<Switch checked={priorityMode} onChange={()=>handleSetPriorityMode(!priorityMode)} />}
              label="Modo prioridade(foco na leitura de dados atual)"
            /> <br/>
            <FormControlLabel margin="dense"
              control={<Switch checked={themeName == 'dark'} onChange={toggleTheme} />}
              label="Tema escuro (instável)"
            /> <br/>
            <FormControlLabel margin="dense"
              control={<Switch checked={autoConnect} onChange={(e) => handleSetAutoConnect(e.target.checked)} />}
              label="Conexão automática com Arduino (não está funcionando)"
            />
            <FormControl fullWidth margin="dense" size='small'>
              <Typography variant="h7">
                Sistema de Unidades:
              </Typography>
              <Select value={unitSystem} onChange={(e) => handleSetUnitSystem(e.target.value)}>
                {unitOptions.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl >
          </Box>
        )}
        {tabIndex === 1 && (
          <Box padding={4}>
            <Typography variant="h5" gutterBottom>
              Gerenciamento de Dados
            </Typography>
            <Box marginBottom={2} marginTop={2}><Divider/></Box>
            <Typography variant="h7">
              Nome padrão aos novos datasets:
            </Typography>
            <TextField
              value={defaultName}
              onChange={(e) => handleSetDefaultName(e.target.value)}
              fullWidth
              margin="dense"
              size='small'
            />
            <Typography variant="h7">
              Número máximo de datasets armazenados em cache:
            </Typography>
            <TextField
              type="number"
              value={maxDatasets}
              onChange={(e) => handleSetMaxDatasets(Math.max(1, Number(e.target.value)))}
              fullWidth
              margin="dense"
              size='small'
            />
            <Typography variant="h7">
              Ordem de exclusão de cache:
            </Typography>
            <FormControl fullWidth margin="dense" size='small'>
              <Select value={deleteCache} onChange={(e) => handleSetDeleteCache(e.target.value)}>
                {deleteCacheOptions.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
          </Box>
        )}
      </Card>
    </Container>
  );
};
