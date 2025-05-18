import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material'

import { FixedSizeList } from 'react-window'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

/**
 * PointsComponent renders a scrollable list of points with formatted x and y values
 *
 * @param {(value: number) => string} formatPoint   - Function to format point values (e.g., rounds numbers)
 * @param {number[]} xArray                         - Array of x-coordinates
 * @param {number[]} yArray                         - Array of y-coordinates
 */
export const PointsComponent = ({ 
  formatPoint,
  xArray, yArray 
}) => {

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