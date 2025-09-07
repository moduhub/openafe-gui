/**
 * Calculate the checksum (XOR) of a string in the OpenAFE style
 * @param {string} input - Complete command, with or without '$' and '*XX'
 * @returns {string}     - Checksum in hexadecimal with 2 digits (e.g.: '00')
 */
export const calculateChecksum = (input) => {
  if (input.startsWith('$')) 
    input = input.slice(1)

  const asteriskIndex = input.indexOf('*')
  if (asteriskIndex !== -1) 
    input = input.slice(0, asteriskIndex)

  let checksum = 0
  for (let i = 0; i < input.length; i++) 
    checksum ^= input.charCodeAt(i)

  return checksum.toString(16).toUpperCase().padStart(2, '0')
}