import { TextField, Box, Card, CardContent, List, ListItem } from '@mui/material';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';

import { iniciarLeitura, finalizarLeitura } from '../components/arduino/ArduinoControle';
import { ChartComponent } from '../components/grafico/Grafico';
import { useChart } from '../hooks'

export const LayoutBaseDePagina = ({ children }) => {

  const theme = useTheme();
  const { chartData, setChartData, clearChart, addDataToChart } = useChart();

  return (
    <Box height="100%" width="100%" display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
      <Box display="none">
        <Button onClick={iniciarLeitura} >Iniciar Leitura</Button>
        <Button onClick={finalizarLeitura} >Parar Leitura</Button>
        <Button onClick={()=>clearChart(setChartData)}>Limpar Gráfico</Button>
      </Box>
      
      {/*Controle de leitura e gravação de dados*/}
      <Box width={theme.spacing(40)} height="100%" flexShrink="0">
        <Card sx={{ borderRadius: '16px' }}>
          <CardContent>

            <List>
              <ListItem>
                <TextField label="Settling Time (ms)" defaultValue="1000" type="number" fullWidth />
              </ListItem>
              <ListItem>
                <TextField label="Start Potential (mV)" defaultValue="-800" type="number" fullWidth />
              </ListItem>
              <ListItem>
                <TextField label="End Potential (mV)" defaultValue="0" type="number" fullWidth />
              </ListItem>
              <ListItem>
                <TextField label="Step (mV)" defaultValue="10" type="number" fullWidth />
              </ListItem>
              <ListItem>
                <TextField label="Scan Rate (mV/s)" defaultValue="100" type="number" fullWidth />
              </ListItem>
              <ListItem>
                <TextField label="Cycles" defaultValue="1" type="number" fullWidth />
              </ListItem>
            </List>

            <Box width="100%" display="flex" justifyContent="center" gap={theme.spacing(3)}>
              <Button onClick={iniciarLeitura} color="default" variant="outlined"><PlayArrowIcon/></Button>
              <Button onClick={finalizarLeitura} color="contrastText" variant="outlined"><StopIcon /></Button>
              <Button onClick={()=>clearChart(setChartData)} color="contrastText" variant="outlined"><DeleteIcon /></Button>
            </Box>

          </CardContent>
        </Card>
      </Box>

      {/* Gráfico */}
      <Box>
        <ChartComponent/>
      </Box>

      {/* Controle de Datasheets */}
      <Box width={theme.spacing(28)} maxWidth="25%"></Box>
    </Box>
  )
}