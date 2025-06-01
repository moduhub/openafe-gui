import { Box,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  MenuItem, 
  Select, 
  InputLabel, 
  FormControl,
  ListItemIcon,
  Typography,
} from '@mui/material'
import { Circle, Square, Star, Add, ChangeHistory } from '@mui/icons-material'
import { useState } from 'react'
import { MuiColorInput } from 'mui-color-input'

import { useDatasetsContext } from '../../contexts'

const SYMBOL_OPTIONS = [
  { value: 'circle', icon: <Circle /> },
  { value: 'square', icon: <Square /> },
  { value: 'star', icon: <Star /> },
  { value: 'cross', icon: <Add /> },
  { value: 'triangle-up', icon: <ChangeHistory /> }
]

export const AddMarkDialog = ({ open, onClose, point }) => {

  const { datasets, datasetSelected } = useDatasetsContext()

  const [label, setLabel] = useState('')
  const [symbol, setSymbol] = useState('star')
  const [color, setColor] = useState('#000000')
  const [size, setSize] = useState(12)

  //console.log(point)
  let posPoint = []
  if(point && point.dataset !== undefined && point.index !== undefined && datasets?.[point.dataset]?.data?.[0]){

    if(point.type === "CVW"){
      posPoint = { 
        x : datasets[point.dataset].data[0].x[point.index], 
        y : datasets[point.dataset].data[0].y[point.index] 
      }
    }

    else if(point.type === "EIS"){
      if(point.ref === "bodeMod"){
        posPoint = {
          x : datasets[point.dataset].data[0].omega[point.index],
          y : 20 * Math.log10(datasets[point.dataset].data[0].modZ[point.index])
        }
      }
      else if(point.ref === "bodeAng"){
        posPoint = {
          x : datasets[point.dataset].data[0].omega[point.index],
          y : datasets[point.dataset].data[0].angZ[point.index]
        }
      }
      else if(point.ref === "nyquist"){
        posPoint = {
          x : datasets[point.dataset].data[0].realZ[point.index],
          y : datasets[point.dataset].data[0].imagZ[point.index]
        }
      }
    }
  }
    

  const handleSave = () => {
    const newMarker = { 
      ...posPoint, 
      label, 
      symbol, 
      color, 
      size,
      isVisible: true,
      ref: point.ref
    }

    datasets[datasetSelected]?.addPointMarker(newMarker)

    setLabel('')
    setSymbol('cross')
    setColor('#000000')
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Markup</DialogTitle>
      <DialogContent>

        <Typography mb={3}>
          {point && point.dataset !== undefined && point.index !== undefined && datasets?.[point.dataset]?.data?.[0] ? (
            <>Point: ({posPoint.x}, {posPoint.y})</>
          ) : (
            <>Selecione um ponto</>
          )}
        </Typography>

        <TextField
          label="Nome da marcação"
          value={label}
          onChange={e => setLabel(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel id="symbol-label">Symbol</InputLabel>
            <Select
              labelId="symbol-label"
              value={symbol}
              label="Símbolo"
              onChange={e => setSymbol(e.target.value)}
            >
              {SYMBOL_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value} sx={{ display: 'flex', alignItems: 'center' }}>
                <ListItemIcon sx={{ color: color, minWidth: 32 }}>
                  {opt.icon}
                </ListItemIcon>
              </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ flex: 2 }}>
            <MuiColorInput value={color} onChange={setColor}/>
          </FormControl>
        </Box>

        <TextField
          label="Tamanho do marcador"
          type="number"
          value={size}
          onChange={e => setSize(Number(e.target.value))}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} disabled={!label}>Salvar</Button>
      </DialogActions>
    </Dialog>
  )
}
