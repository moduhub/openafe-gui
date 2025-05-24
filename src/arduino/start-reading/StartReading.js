/**
 * Send command to the Arduino to start reading
 * 
 * @param {Function} handleSetIsReading - Callback to set the reading state (true when reading starts)
 * @param {object} currentParams - Current experiment parameters
 * @param {string} experimentType - Type of experiment ('CV' or 'EIS')
 */
export const StartReading = (handleSetIsReading, currentParams, experimentType) => {
  handleSetIsReading(true)

  if (experimentType === 'CV') {
    window.electron.sendCommand(
      '$CVW,' +
      currentParams.settlingTime + ',' +
      currentParams.startPotential + ',' +
      currentParams.endPotential + ',' +
      currentParams.step + ',' +
      currentParams.scanRate + ',' +
      (currentParams.cycles ?? 0) + '*54'
    )
  } 
  else if (experimentType === 'EIS') {
    window.electron.sendCommand(
      '$EIS,' +
      currentParams.settlingTime + ',' +
      currentParams.startOmega + ',' +
      currentParams.endOmega + ',' +
      currentParams.step + ',' +
      currentParams.scanRate + ','
    )
  }
}