/**
 * Disconnect from the connected serial port
 */

export const DisconnectPort = () => {
  window.electron.disconnectPort()
} 