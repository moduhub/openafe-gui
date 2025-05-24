import { Box, Card, CardContent, Tab, Tabs } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import MinimizeIcon from '@mui/icons-material/Minimize'
import { useState } from "react"
import { useTheme } from "@mui/material"
import { useDashboardContext, useDatasetsContext } from '../../contexts'
import { CVComponent, DPVComponent, EISComponent } from '..'

/**
 * TabArduino component provides a UI panel for 
 * configuring and controlling Arduino data acquisition
 * 
 * @returns {JSX.Element|null}
 */
export const TabArduino = () => {

  const theme = useTheme()

  const {
    tabArduinoIsMinimized: isMinimized,
    handleToggleTabArduinoMinimized: setIsMinimized,
  } = useDashboardContext()
  const { handleExperimentType } = useDatasetsContext()

  const [tabIndex, setTabIndex] = useState(0)

  if (isMinimized)
    return null

  const handleTabChange = (_, idx) => {
    setTabIndex(idx)
    if (idx === 0) handleExperimentType('CV')
    else if (idx === 1) handleExperimentType('DPV')
    else if (idx === 2) handleExperimentType('EIS')
  }

  return (
    <Box
      width={theme.spacing(35)} minWidth={theme.spacing(35)}
      height={530} minHeight={530}
      display="flex"
      flexShrink="0"
      marginTop={theme.spacing(2)} marginBottom={theme.spacing(2)}
      transition="width 0.3s ease"
      alignItems="start"
      position="absolute"
      top={theme.spacing(15)}
      left={0}
      zIndex={2}
    >
      <Card
        sx={{
          borderRadius: "16px",
          backgroundColor: theme.palette.background.paper,
          boxShadow: `0 2px 10px rgba(0, 0, 0, 0.2)`,
          border: "1px solid rgba(0, 0, 0, 0.12)",
          width: "100%", height: "100%",
        }}
      >
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: null,
            color: theme.palette.text.primary,
          }}
        >
          <Box 
            width="100%" gap={1} 
            display="flex" 
            flexDirection="row" justifyContent="space-between"
          >
            <Box display="flex" alignItems="flex-start">
              <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                variant="fullWidth"
              >
                <Tab 
                  value={0} label="CV"
                  sx={{ minWidth: 70, padding: '0px' }}
                />
                <Tab
                  value={1} label="DPV"
                  sx={{ minWidth: 70, padding: '0px' }}
                />
                <Tab
                  value={2} label="EIS"
                  sx={{ minWidth: 70, padding: '0px' }}
                />
              </Tabs>
            </Box>
            <Box display="flex" justifyContent="center" height="34px" width="16px">
              <IconButton
                aria-label="toggle"
                size="small"
                onClick={() => setIsMinimized(true)}
              >
                <MinimizeIcon />
              </IconButton>
            </Box>
          </Box>
          <Box 
            width="100%" height="100%"
            display="flex" 
            flexDirection="column" alignItems="center"
            overflow="auto"
          >
            {tabIndex === 0 && <CVComponent />}
            {tabIndex === 1 && <DPVComponent />}
            {tabIndex === 2 && <EISComponent />}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}