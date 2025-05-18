/**
 * Forces the reading stop
 */

export const FinishReading = () => {
  window.electron.sendCommand('$CMD,DIE*2E')
}