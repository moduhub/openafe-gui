import React from 'react'
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  useTheme,
  IconButton,
  Tooltip,
  Stack,
  Chip,
  Divider,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'

import { PointsComponent } from '..'

/**
 * Component that displays interpolations (polynomial and Gaussian)
 */
export const InterpolationComponent = ({ 
  dataset, 
  datasetIndex, 
  onToggleVisibility, 
  onDeleteInterpolation,
}) => {
  const theme = useTheme()

  const formatPoint = (val) => Number(val).toFixed(1)

  if (!dataset.interpolations || dataset.interpolations.length === 0) {
    return null
  }

  return (
    <>
      {dataset.interpolations.map((interpolation, i) => {
        const { 
          name, type, data, 
          order, coefficients, 
          weights, sigma, mu, amplitude 
        } = interpolation
        const title = name || `${type} ${i + 1}`
        const xArray = data?.[0]?.x || []
        const yArray = data?.[0]?.y || []

        return (
          <Accordion key={i} sx={{ width: '100%' }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ color: interpolation.isVisible ? 'inherit' : 'gray' }}
            >
              <Typography variant="body1" noWrap>
              {title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Button
                  onClick={() => onToggleVisibility(datasetIndex, i)}
                  size="small"
                  startIcon={
                    interpolation.isVisible ? <VisibilityOffIcon /> : <VisibilityIcon />
                  }
                >
                </Button>
                <Button
                  onClick={() => onDeleteInterpolation(datasetIndex, i)}
                  size="small"
                  startIcon={<DeleteIcon />}
                >
                </Button>
              </Box>

              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="subtitle2">Type:</Typography>
                <Chip
                  label={type.toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: type === 'polinomial' ? theme.palette.primary.light : theme.palette.success.light,
                    color: theme.palette.getContrastText(
                      type === 'polinomial' ? theme.palette.primary.light : theme.palette.success.light
                    ),
                  }}
                />
              </Box>

              <Divider />
        
              {type === 'polinomial' && (
                <>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="subtitle2">Order:</Typography>
                    <Typography variant="subtitle2">{order ?? '-'}</Typography>
                  </Box>

                  <Box mb={1}>
                    <Typography variant="subtitle2" gutterBottom>
                      Coefficients:
                    </Typography>
                    {coefficients && coefficients.length > 0 ? (
                      <Stack direction="column" spacing={1}>
                        {coefficients.map((c, idx) => (
                          <Box key={idx} display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" sx={{ minWidth: 30 }}>{`a${idx}:`}</Typography>
                            <Chip label={c.toFixed(4)} size="small" />
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Nenhum valor disponível
                      </Typography>
                    )}
                  </Box>
                </>
              )}

              {type === 'gaussiana' && (
                <>
                  <Box mb={1}>
                    <Typography variant="subtitle2" gutterBottom>
                      Parameters:
                    </Typography>
                    <Stack direction="column" spacing={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" sx={{ minWidth: 70 }}>Sigma:</Typography>
                        <Chip label={(sigma ?? '-').toFixed?.(4) ?? '-'} size="small" />
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" sx={{ minWidth: 70 }}>Mu:</Typography>
                        <Chip label={(mu ?? '-').toFixed?.(4) ?? '-'} size="small" />
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" sx={{ minWidth: 70 }}>Amplitude:</Typography>
                        <Chip label={(amplitude ?? '-').toFixed?.(4) ?? '-'} size="small" />
                      </Box>
                    </Stack>
                  </Box>
                </>
              )}           

              <Divider />

              <PointsComponent
                formatPoint={formatPoint}
                xArray={xArray}
                yArray={yArray}
              />
            </AccordionDetails>
          </Accordion>
        )
      })}
    </>
  )
}
