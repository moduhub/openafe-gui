/**
 * Send command to the Arduino to start reading
 * 
 * @param {String} type                 - Type of reading (e.g., '$CVM')
 * @param {Number} settlingTime         - Time (in milliseconds) to wait before starting the measurement
 * @param {Number} startPotential       - Starting potential for the scan (in millivolts)
 * @param {Number} endPotential         - Ending potential for the scan (in millivolts)
 * @param {Number} step                 - Step size of the scan (in millivolts)
 * @param {Number} scanRate             - Scan rate (in millivolts per milisecond)
 * @param {Number} cycles               - Number of scan cycles to perform
 * @param {Function} handleSetIsReading - Callback to set the reading state (true when reading starts)
 */

export const StartReading = (
  type, settlingTime, startPotential, endPotential, step, scanRate, cycles, 
  handleSetIsReading
) => {
  handleSetIsReading(true)
  //window.electron.sendCommand('$CVW,1000,-800,0,100,2,1*54'); Example
  window.electron.sendCommand(  
    type + ',' + 
    settlingTime + ',' + 
    startPotential + ',' +
    endPotential + ',' +
    step + ',' + 
    scanRate + ',' +
    cycles + '*54')
}