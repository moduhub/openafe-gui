import { useState ,useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Tabs,
  Tab,
} from "@mui/material"

import { useDatasetsContext } from "../../contexts"

import { InterpolationTab } from '../points-selected/InterpolationTab'
import { AreaTab } from "../points-selected/AreaTab"

/**
 * Dialogue that controls the functions when the user selects two points
 * 
 * @param {boolean} open                              - Whether the dialog is currently visible
 * @param {() => void} onClose                        - Callback to trigger when the dialog is closed
 * @param {{ x: number, y: number }[]} selectedPoints - Array of two points selected for interpolation
 *
 * @returns {JSX.Element} 
 */
export const PointsSelectedDialog = ({ open, onClose, selectedPoints }) => {
  const { datasets, datasetSelected } = useDatasetsContext()
  const [tabIndex, setTabIndex] = useState(0)

  const handleCloseDialog = () => {
    onClose()
  }

  return(
    <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
      <DialogTitle>
        {datasets?.[datasetSelected]?.name || "unknown set"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography>
            Selected points:
          </Typography>
          <Typography>
            Point 1: {selectedPoints?.[0] ? `(${selectedPoints[0].x}, ${selectedPoints[0].y})` : "Não selecionado"}
          </Typography>
          <Typography>
            Point 2: {selectedPoints?.[1] ? `(${selectedPoints[1].x}, ${selectedPoints[1].y})` : "Não selecionado"}
          </Typography>
        </Box>
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} centered>
          <Tab label="Interpolation" />
          <Tab label="Area under the curve" />
        </Tabs>
        <Box sx={{ mt: 2 }}>
          {tabIndex === 0 && (
            <InterpolationTab
              open={open}
              selectedPoints={selectedPoints}
              onClose={handleCloseDialog}
            />
          )}
          {tabIndex === 1 && (
            <AreaTab
              open={open}
              selectedPoints={selectedPoints}
              onClose={handleCloseDialog}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}