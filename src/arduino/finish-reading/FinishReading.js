import { calculateChecksum } from '../../shared/math-functions'

/**
 * Forces the reading stop and reset Arduino
 */
export const FinishReading = () => {
  const forceReset = "CMD,DIE"
  const checksum = calculateChecksum(forceReset)
  window.electron.sendCommand(`$${forceReset}*${checksum}`)
}