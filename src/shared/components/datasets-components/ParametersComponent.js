import React, { useState } from 'react'
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Typography,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'

import { useDatasetsContext } from '../../contexts'
import { ParametersInsertionDialog } from '..'

export const ParametersComponent = ({ dataset }) => {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('sm'))

  const { addDatasetParam } = useDatasetsContext()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleAdd = (name, value) => {
    addDatasetParam(dataset.name, name, value)
    setDialogOpen(false)
  }

  const handleOpen = (e) => {
    e.stopPropagation()
    setDialogOpen(true)
  }

  const entries = Object.entries(dataset.params)

  return (
    <>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />}>
          <Typography variant="body1" noWrap size="small">
            Parameters
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          {entries.length > 0 ? (
            <Stack spacing={1}>
              {entries.map(([key, value]) => (
                <Box
                  key={key}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                    {key}:
                  </Typography>
                  <Chip
                    label={value}
                    size="small"
                    sx={{
                      maxWidth: isXs ? 80 : 140,
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  />
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Nenhum parâmetro adicionado.
            </Typography>
          )}

        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon fontSize="small" />}
          onClick={handleOpen}
          sx={{
            mt: 2,
            fontWeight: 'bold',
            textTransform: 'none',
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            '&:hover': {
              borderColor: theme.palette.primary.dark,
              backgroundColor: 'transparent',
            },
          }}
        >
          New Parameters
        </Button>

        </AccordionDetails>
      </Accordion>

      <ParametersInsertionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAdd}
      />
    </>
  )
}
