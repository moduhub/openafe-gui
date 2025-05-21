import { Box, Typography, Chip, Stack, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

/**
 * AreaMarkers displays the list of saved areas for a dataset
 *
 * @param {Object[]} areas - Array of areas [{ value, start, end }]
 */
export const AreaMarkers = ({ areas }) => {
  if (!areas || areas.length === 0) return null

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />}>
        <Typography variant="body1" noWrap size="small">
          Areas
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1}>
          {areas.map((area, idx) => (
            <Box key={idx} display="flex" flexDirection="column" gap={0.5}>
              <Box display="flex" alignItems="center" gap={2}>
                <Chip label={`#${idx + 1} Area`} size="small" />
              </Box>
              <Typography variant="body2">
                  Value: <b>{area.value?.toExponential?.(3) ?? area.value}</b> [V·A]
                </Typography>
              <Typography variant="caption" color="text.secondary">
                (from {area.start} to {area.end})
              </Typography>
            </Box>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}