import { useEffect, useState } from 'react'
import { Box, Card, CardContent, Tab, Tabs, IconButton } from '@mui/material'
import MinimizeIcon from '@mui/icons-material/Minimize'
import { useTheme } from '@mui/material'
import { useDashboardContext, useDatasetsContext } from '../../contexts'
import { ArduinoReadingComponent } from '..'

/**
 * @brief TabArduino component provides a UI panel for
 * configuring and controlling Arduino data acquisition
 * 
 * Behavior:
 * - Displays tabs for different experiment types (CVW, DPV, SWV, EIS).
 * - Allows switching between experiment types, updating the global context.
 * - Can be minimized to hide the panel.
 * - Integrates the ArduinoReadingComponent to show real-time data/status.
 */
export const TabArduino = () => {
  const theme = useTheme()
  const {
    tabArduinoIsMinimized: isMinimized,
    handleToggleTabArduinoMinimized: toggleMinimized,
  } = useDashboardContext()

  const { 
    handleExperimentType,
    experimentType
  } = useDatasetsContext()

  const tabTypes = ['CVW', 'DPV', 'SWV', 'EIS']
  const [tabIndex, setTabIndex] = useState(
    Math.max(0, tabTypes.indexOf(experimentType))
  )

  useEffect(() => {
    const idx = tabTypes.indexOf(experimentType)
    if (idx >= 0 && idx !== tabIndex) {
      setTabIndex(idx)
    }
  }, [experimentType, tabIndex, tabTypes])

  const onTabChange = (_, idx) => {
    setTabIndex(idx)
    handleExperimentType(tabTypes[idx])
  }

  if (isMinimized) return null

  return (
    <Box
      width={theme.spacing(35)}
      minWidth={theme.spacing(35)}
      height={640}
      minHeight={530}
      display="flex"
      flexShrink={0}
      mt={2}
      mb={2}
      transition="width 0.3s ease"
      alignItems="start"
      position="absolute"
      top={theme.spacing(15)}
      left={0}
      zIndex={2}
    >
      <Card
        sx={{
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          boxShadow: 2,
          border: '1px solid rgba(0, 0, 0, 0.12)',
          width: '100%',
          height: '100%',
        }}
      >
        <CardContent
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            p: 0,
            color: theme.palette.text.primary,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={1}>
             <Tabs
              value={tabIndex}
              onChange={onTabChange}
              variant="fullWidth"
            >
              <Tab label="CVW" sx={{ minWidth: 55, p: 0 }} />
              <Tab label="DPV" sx={{ minWidth: 55, p: 0 }} />
              <Tab label="SWV" sx={{ minWidth: 55, p: 0 }} />
              <Tab label="EIS" sx={{ minWidth: 55, p: 0 }} />
            </Tabs>
            <IconButton size="small" onClick={() => toggleMinimized(true)}>
              <MinimizeIcon />
            </IconButton>
          </Box>

          <Box
            flex={1}
            display="flex"
            flexDirection="column"
            alignItems="center"
            overflow="auto"
          >
            <ArduinoReadingComponent />
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}