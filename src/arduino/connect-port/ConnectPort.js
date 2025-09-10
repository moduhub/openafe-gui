/**
 * Connects to a specific serial port
 * 
 * @param {String} port               - Port path, example COM3
 * @param {Function} setPortSelected  - Function that defines the selected port
 * @param {Function} handleSetIsConnecting - function to toggle "connecting" state (from context)
 * @param {Function} setSnackbar     - function to show snackbar (from context)
 */
export const ConnectPort = async (
  port, 
  setPortSelected, 
  handleSetIsConnecting = () => {}, 
  setSnackbar = () => {}
) => {
  try {
    handleSetIsConnecting(true)
  } catch (err) {
    console.warn('handleSetIsConnecting is not a function or failed:', err)
  }
  
  try {
    setSnackbar({ open: true, message: 'Connecting to Arduino...', severity: 'info' })
  } catch (err) {
    console.warn('setSnackbar is not a function or failed:', err)
  }

  if (typeof setPortSelected === 'function') {
    try {
      setPortSelected(port)
    } catch (err) {
      console.error('Error setting the selected port:', err)
    }
  }

  try {
    await window.electron.connectToPort(port)
  } catch (err) {
    console.error('Error connecting to the port:', err)
    try { handleSetIsConnecting(false) } catch (e) {}
    try {
      setSnackbar({ open: true, message: `Error connecting: ${err?.message || err}`, severity: 'error' })
    } catch (e) {}
  }
}