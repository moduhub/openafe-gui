/**
 * Calcula o checksum (XOR) de uma string no estilo OpenAFE
 * @param {string} input - A string entre "$" e "*"
 * @returns {string} - Checksum em hexadecimal com 2 dígitos (ex: '3C')
 */
export const calculateChecksum = (input) => {
  let checksum = 0
  for (let i = 0; i < input.length; i++) {
    checksum ^= input.charCodeAt(i)
  }
  return checksum.toString(16).toUpperCase().padStart(2, '0')
}