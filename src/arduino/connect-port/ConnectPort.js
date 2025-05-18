/**
 * Connects to a specific serial port
 * 
 * @param {String} port               - Port path, example COM 3
 * @param {Function} setPortSelected  - Function that defines the selected port
 */

export const ConnectPort = (port, setPortSelected) => {
  setPortSelected(port)
  window.electron.connectToPort(port)
}