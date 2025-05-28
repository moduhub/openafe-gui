/**
 * Forces the reading stop
 */

export const FinishReading = () => {
  window.electron.sendCommand('$BFE')
}