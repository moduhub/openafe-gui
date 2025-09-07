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
 * PointsComponent renders a scrollable list of points for a dataset.
 * Handles both simple (CV) and complex (IES) datasets.
 *
 * @param {object} dataset - The dataset object containing data and type.
 */
export const PointsComponent = ({ dataset }) => {
  if (!dataset || !dataset.data || !dataset.data[0]) return null

  // Helper to format numbers
  const formatPoint = (val) =>
    typeof val === 'number' ? Number(val).toFixed(2) : val

  // Decide mapping based on dataset type
  const type = dataset.type || ''
  const data = dataset.data[0]

  let itemCount = 0
  let renderRow = () => null
  let itemSize = 20

  if (type.startsWith('CV')) {
    // Simple points (x, y)
    const xArray = data.x || []
    const yArray = data.y || []
    itemCount = Math.min(xArray.length, yArray.length)
    renderRow = ({ index, style }) => (
      <Box style={style}>
        <Typography variant="caption">
          {index}: [{formatPoint(xArray[index])} ; {formatPoint(yArray[index])}]
        </Typography>
      </Box>
    )
  } else if (type.startsWith('IE') || type.startsWith('EIS')) {
    // Complex points (omega, modZ, angZ, realZ, imagZ)
    const omega = data.omega || []
    const modZ = data.modZ || []
    const angZ = data.angZ || []
    const realZ = data.realZ || []
    const imagZ = data.imagZ || []
    itemCount = Math.min(
      omega.length,
      modZ.length,
      angZ.length,
      realZ.length,
      imagZ.length
    )
    itemSize = 140
    renderRow = ({ index, style }) => (
      <Box style={style}>
        <Typography variant="caption">
          {index+1}: <br/>
          ω={formatPoint(omega[index])} <br/>
          |Z|={formatPoint(modZ[index])} <br/> 
          θ={formatPoint(angZ[index]*180.0/3.1415)} °<br/>
          Re={formatPoint(realZ[index])} <br/> 
          Im={formatPoint(imagZ[index])} <br/>
        </Typography>
      </Box>
    )
  }

  return (
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
            itemSize={itemSize}
            itemCount={itemCount}
            overscanCount={5}
          >
            {renderRow}
          </FixedSizeList>
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}