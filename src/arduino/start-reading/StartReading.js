import { calculateChecksum } from '../../shared/math-functions'

/**
 * Send command to the Arduino to start reading
 * 
 * @param {Boolean} isDummy               - To use the Dummy or not
 * @param {Function} handleSetIsReading   - Callback to set the reading state (true when reading starts)
 * @param {object} currentParams          - Current experiment parameters
 * @param {string} experimentType         - Type of experiment ('CV' or 'EIS')
 * @param {string} currentRange_microamps - It represents the current range in microamperes.
 * @param {string} portConnected          - The serial port that is connected
 */
export const StartReading = (
  isDummy = true,
  handleSetIsReading = ()=>{}, 
  currentParams = {settlingTime:1000,startPotential:-800,endPotential:0,step:10,scanRate:500,cycles:1}, 
  experimentType = "CVW",
  currentRange_microamps = 200,
  portConnected = "COM3"
) => {

  if(!isDummy){
    const commandBody = `$CMD,CUR,${currentRange_microamps}*`
    const checksum = calculateChecksum(commandBody)
    window.electron.sendCommand(`${commandBody}${checksum}`)
  }

  // DUMMY
  else {
    handleSetIsReading(true)
    switch (experimentType) {
      case 'CVW':
        window.electron.sendCommand(
          '$CVW,' +
          currentParams.settlingTime + ',' +
          currentParams.startPotential + ',' +
          currentParams.endPotential + ',' +
          currentParams.step + ',' +
          currentParams.scanRate + ',' +
          (currentParams.cycles ?? 0) + '*54'
        )
        break
      case 'DPV':
        // NOT IMPLEMENTED
        break
      case 'SWV':
        // NOT IMPLEMENTED
        break
      case 'EIS':
        window.electron.sendCommand(
          '$EIS,' +
          currentParams.settlingTime + ',' +
          currentParams.startOmega + ',' +
          currentParams.endOmega + ',' +
          currentParams.stepForADecade + ',' +
          currentParams.scanRate + ','
        )
        break
      default:
        break
    }
  }
  
}