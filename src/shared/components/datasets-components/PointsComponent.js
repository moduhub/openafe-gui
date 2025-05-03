import React, { useState } from 'react'
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  useTheme,
} from '@mui/material'

import { FixedSizeList } from 'react-window'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

export const PointsComponent = ({ 
  formatPoint,
  xArray, yArray 
}) => {
  const theme = useTheme()

  return (
    <>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />}>
          <Typography variant="body1" noWrap size="small">
            Points
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Box>
            <FixedSizeList
              height={125}
              width="100%"
              itemSize={20}
              itemCount={xArray.length}
              overscanCount={5}
            >
              {({ index, style }) => (
                <Box style={style}>
                  <Typography variant="caption">
                    {index}: [{formatPoint(xArray[index])} ; {formatPoint(yArray[index])}]
                  </Typography>
                </Box>
              )}
            </FixedSizeList>
          </Box>
        </AccordionDetails>
      </Accordion>
    </>
  )
}
