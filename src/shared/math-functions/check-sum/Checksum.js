/**
 * @brief Calculate the checksum (XOR) of a string in the OpenAFE style
 * 
 * @param {string} input - Complete command, with or without '$' and '*XX'
 * @returns {string} - Checksum in hexadecimal with 2 digits (e.g.: '00')
 * 
 * Behavior:
 * 1. If the string starts with '$', remove it.
 * 2. If the string contains '*', remove everything from '*' to the end.
 * 3. Calculate the XOR of all characters in the remaining string.
 * 4. Return the checksum as a two-digit hexadecimal string.
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