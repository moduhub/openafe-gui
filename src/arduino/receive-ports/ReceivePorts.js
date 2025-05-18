/**
 * Recovers and filters the available serial ports based on vendorId and productId, 
 * and updates the state with the list of valid ports.
 * 
 * @param {Function} setPorts - Function to define the available serial ports
 */

export const ReceivePorts = async (setPorts) => {
  try {
    const portsData = await new Promise((resolve, reject) => {
      try {
        window.electron.getAvailablePorts((ports) => {
          const filteredPorts = ports.filter((port) => {
            return (
              port.vendorId === '2341' && 
              (port.productId === '0043' || port.productId === '0001') 
            )
          })
          resolve(filteredPorts)
        })
      } catch (error) {
        console.error("Error listing ports:", error)
        reject(error)
      }
    })

    setPorts(Array.isArray(portsData) ? portsData : [])
  } catch (error) {
    console.log("It was not possible to receive the doors:", error)
  }
  
}