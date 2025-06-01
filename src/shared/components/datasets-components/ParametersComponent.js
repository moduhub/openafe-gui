import { useState } from 'react'
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  Button,
  Divider
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EditIcon from '@mui/icons-material/Edit'

import { useDatasetsContext } from '../../contexts'
import { ParametersInsertionDialog } from '..'

export const ParametersComponent = ({ dataset }) => {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('sm'))

  const { 
    addDatasetParam,
    editDatasetParam,
    deleteDatasetParam 
  } = useDatasetsContext()
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
  const entries_e = Object.entries(dataset.params_e)

  return (
    <>
      <ParametersInsertionDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onCreate={(name, value) => addDatasetParam(dataset.name, name, value)}
          onEdit={(name, value) => editDatasetParam(dataset.name, name, value)}
          onDelete={(name) => deleteDatasetParam(dataset.name, name)}
          parameters={dataset.params_e}
      />

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />}>
          <Typography variant="body1" noWrap>
            Parameters
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Box display="flex" justifyContent="center" mb={2}>
            <Chip
              label={dataset.type}
              size="small"
              sx={{
                fontWeight: 'bold',
                px: 1.5,
                textTransform: 'capitalize',
              }}
            />
          </Box>

          {(entries.length > 0 || entries_e.length > 0) && (
            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Base Parameters
              </Typography>
            </Divider>
          )}

          {entries.length > 0 ? (
            <Stack spacing={1} mb={2}>
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
            <Typography variant="body2" color="text.secondary" mb={2}>
              No base parameters.
            </Typography>
          )}

          {(entries.length > 0 || entries_e.length > 0) && (
            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Advanced
              </Typography>
            </Divider>
          )}

          {entries_e.length > 0 ? (
            <Stack spacing={1}>
              {entries_e.map(([key, value]) => (
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
              No advanced parameters.
            </Typography>
          )}

          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon fontSize="small" />}
              onClick={handleOpen}
              sx={{
                fontWeight: 'bold',
                textTransform: 'none',
                borderColor: theme.palette.secondary.main,
                color: theme.palette.secondary.main,
                '&:hover': {
                  borderColor: theme.palette.secondary.dark,
                  backgroundColor: 'transparent',
                },
              }}
            >
              Edit Advanced Parameters
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </>
  )
}
