import { useState } from "react"
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
          {/* Exibe o gráfico de origem se for EIS */}
          {selectedPoints?.[0]?.type === "EIS" && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle2" color="secondary">
                Gráfico selecionado:&nbsp;
                {selectedPoints[0].ref === "bodeMod" && "Bode |Z| (dB)"}
                {selectedPoints[0].ref === "bodeAng" && "Bode Phase (°)"}
                {selectedPoints[0].ref === "nyquist" && "Nyquist"}
              </Typography>
            </Box>
          )}
          {/* Mostra os pontos conforme o tipo */}
          {selectedPoints?.[0]?.type === "EIS" ? (
            <>
              <Typography>
                Ponto 1: {selectedPoints?.[0]
                  ? (() => {
                      const p = selectedPoints[0]
                      const ds = datasets?.[p.dataset]?.data?.[0]
                      if (!ds) return "Não selecionado"
                      if (p.ref === "bodeMod") {
                        const x = ds.omega?.[p.index]
                        const y = ds.modZ?.[p.index]
                        return `(${x}, ${y !== undefined ? (20 * Math.log10(Math.max(y, 1e-12))).toFixed(2) + " dB" : "?"})`
                      }
                      if (p.ref === "bodeAng") {
                        const x = ds.omega?.[p.index]
                        const y = ds.angZ?.[p.index]
                        return `(${x}, ${y !== undefined ? y + " °" : "?"})`
                      }
                      if (p.ref === "nyquist") {
                        const x = ds.realZ?.[p.index]
                        const y = ds.imagZ?.[p.index]
                        return `(${x}, ${y})`
                      }
                      return "Não selecionado"
                    })()
                  : "Não selecionado"}
              </Typography>
              <Typography>
                Ponto 2: {selectedPoints?.[1]
                  ? (() => {
                      const p = selectedPoints[1]
                      const ds = datasets?.[p.dataset]?.data?.[0]
                      if (!ds) return "Não selecionado"
                      if (p.ref === "bodeMod") {
                        const x = ds.omega?.[p.index]
                        const y = ds.modZ?.[p.index]
                        return `(${x}, ${y !== undefined ? (20 * Math.log10(Math.max(y, 1e-12))).toFixed(2) + " dB" : "?"})`
                      }
                      if (p.ref === "bodeAng") {
                        const x = ds.omega?.[p.index]
                        const y = ds.angZ?.[p.index]
                        return `(${x}, ${y !== undefined ? y + " °" : "?"})`
                      }
                      if (p.ref === "nyquist") {
                        const x = ds.realZ?.[p.index]
                        const y = ds.imagZ?.[p.index]
                        return `(${x}, ${y})`
                      }
                      return "Não selecionado"
                    })()
                  : "Não selecionado"}
              </Typography>
              {/* Visual tag para EIS */}
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                {["bodeMod", "bodeAng", "nyquist"].map(ref => (
                  <Box
                    key={ref}
                    sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      bgcolor: selectedPoints[0]?.ref === ref ? "secondary.main" : "grey.300",
                      color: selectedPoints[0]?.ref === ref ? "common.white" : "text.primary",
                      fontWeight: selectedPoints[0]?.ref === ref ? "bold" : "normal",
                      fontSize: 13,
                    }}
                  >
                    {ref === "bodeMod" && "Bode |Z|"}
                    {ref === "bodeAng" && "Bode Phase"}
                    {ref === "nyquist" && "Nyquist"}
                  </Box>
                ))}
              </Box>
            </>
          ) : (
            <>
              <Typography>
                Point 1: {selectedPoints?.[0] ? `(${selectedPoints[0].x}, ${selectedPoints[0].y})` : "Não selecionado"}
              </Typography>
              <Typography>
                Point 2: {selectedPoints?.[1] ? `(${selectedPoints[1].x}, ${selectedPoints[1].y})` : "Não selecionado"}
              </Typography>
            </>
          )}
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