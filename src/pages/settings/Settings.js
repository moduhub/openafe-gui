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
} from '@mui/material'

import { useAppThemeContext, useSettingsContext } from '../../shared/contexts'

/**
 * Settings component for managing application configuration
 * 
 * Provides two tabs:
 *  - General: Contains settings related to app behavior and UI themes
 *    * Priority Mode toggle (focuses on current data reading)
 *    * Dark Theme toggle (unstable)
 *    * Auto Connect toggle for Arduino (not currently functional)
 *    * Unit System selection
 * 
 *  - Data Management: Controls dataset-related settings.
 *    * Default name for new datasets
 *    * Maximum number of cached datasets (minimum 1)
 *    * Cache deletion order
 * 
 * State and Context:
 * - Uses `useAppThemeContext` for theme toggling
 * - Uses `useSettingsContext` for managing settings state and handlers
 */
export const Settings = () => {
  const { toggleTheme, themeName } = useAppThemeContext()
  const {
    priorityMode, handleSetPriorityMode,
    autoConnect, handleSetAutoConnect,
    maxDatasets, handleSetMaxDatasets,
    defaultName, handleSetDefaultName,
    deleteCache, handleSetDeleteCache,
    unitSystem, handleSetUnitSystem,
    tabIndex, handleSetTabIndex
  } = useSettingsContext()

  //const languageOptions = ['Ingles (instável)']
  //const displayOptions= ['Exibir todos', 'Pular 2 em 2', 'Pular 5 em 5', 'Pular 10 em 10']
  const deleteCacheOptions = ['Delete the oldest dataset']
  const unitOptions = ['SI']

  return (
    <Container maxWidth="sm" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ width: '100%', p: 2 }}>
        <Tabs value={tabIndex} onChange={(_, newIndex) => handleSetTabIndex(newIndex)} variant="fullWidth">
          <Tab label="General" />
          <Tab label="Data" />
        </Tabs>
        {tabIndex === 0 && (
          <Box padding={4}>
            <Typography variant="h5" gutterBottom>
              General Settings
            </Typography>
            <Box marginBottom={2} marginTop={2}><Divider/></Box>
            <FormControlLabel margin="dense"
              control={<Switch checked={priorityMode} onChange={()=>handleSetPriorityMode(!priorityMode)} />}
              label="Priority mode(focus on reading current data)"
            /> <br/>
            <FormControlLabel margin="dense"
              control={<Switch checked={themeName == 'dark'} onChange={toggleTheme} />}
              label="Dark theme (unstable)"
            /> <br/>
            <FormControlLabel margin="dense"
              control={<Switch checked={autoConnect} onChange={(e) => handleSetAutoConnect(e.target.checked)} />}
              label="Automatic connection with Arduino (not working)"
            />
            <FormControl fullWidth margin="dense" size='small'>
              <Typography variant="h7">
                Unit System:
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
              Data Management
            </Typography>
            <Box marginBottom={2} marginTop={2}><Divider/></Box>
            <Typography variant="h7">
              Default name for new datasets:
            </Typography>
            <TextField
              value={defaultName}
              onChange={(e) => handleSetDefaultName(e.target.value)}
              fullWidth
              margin="dense"
              size='small'
            />
            <Typography variant="h7">
              Maximum number of datasets stored in cache:
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
              Cache deletion order:
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
  )
}