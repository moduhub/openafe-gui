export const StartReading = (
  type, settlingTime, startPotential, endPotential, step, scanRate, cycles, 
  handleSetIsReading
) => {
  
  console.log("Inicio de leitura de dados")

  handleSetIsReading(true)

  //window.electron.sendCommand('$CVW,1000,-800,0,100,2,1*54'); DEFAULT
  window.electron.sendCommand(type+','+settlingTime+','+startPotential+','+endPotential+','+step+','+scanRate+','+cycles+'*54')
};