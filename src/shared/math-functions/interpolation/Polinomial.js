/**
 * @brief Calculates Polinomial Interpolation (Vandermonde + Normal Equation),
 *
 * @param {number[]} xSlice - Array of x values (interval recortado)
 * @param {number[]} ySlice - Array of y values (interval recortado)
 * @param {number} degree - Degree of the interpolating polynomial
 * @param {number[]} interpRangeX - Array of x values to generate interpolation (linear ou log)
 * 
 * @returns {{coefficients: Array, interpolatedX: number[], interpolatedY: number[]}}
 * 
 * Behavior:
 * - xSlice and interpRangeX are in linear scale, ySlice is in linear scale.
 * 
 * @throws Will throw an error if the input arrays are empty or have insufficient points.
 * @throws Will throw an error if the input data is insufficient for the specified polynomial degree.
 * 
 * @note The function performs a polynomial interpolation using the Vandermonde matrix and the normal equation.
 *       The output includes the polynomial coefficients and interpolated values.
 */
export const calculatePolynomialInterpolation = (
  xSlice,
  ySlice,
  degree,
  interpRangeX
) => {
  const n = xSlice.length
  if (n < degree + 1) {
    throw new Error(`Insufficient points for degree ${degree} approximation.`)
  }

  // Build the Vandermonde matrix
  const vandermondeMatrix = xSlice.map((x) =>
    Array.from({ length: degree + 1 }, (_, i) => Math.pow(x, i))
  )

  // Solve for coefficients using the normal equation: (X^T * X) * coeffs = X^T * y
  const transpose = (matrix) =>
    matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]))
  const multiply = (a, b) =>
    a.map((row) =>
      b[0].map((_, colIndex) =>
        row.reduce((sum, value, rowIndex) => sum + value * b[rowIndex][colIndex], 0)
      )
    )
  const invert = (matrix) => {
    const size = matrix.length
    // Deep copy to avoid mutating input
    const m = matrix.map(row => row.slice())
    const identity = m.map((row, i) =>
      row.map((_, j) => (i === j ? 1 : 0))
    )
    for (let i = 0; i < size; i++) {
      let factor = m[i][i]
      if (factor === 0) {
        // Find a row to swap
        for (let k = i + 1; k < size; k++) {
          if (m[k][i] !== 0) {
            [m[i], m[k]] = [m[k], m[i]]
            [identity[i], identity[k]] = [identity[k], identity[i]]
            factor = m[i][i]
            break
          }
        }
      }
      for (let j = 0; j < size; j++) {
        m[i][j] /= factor
        identity[i][j] /= factor
      }
      for (let k = 0; k < size; k++) {
        if (k === i) continue
        const factor2 = m[k][i]
        for (let j = 0; j < size; j++) {
          m[k][j] -= factor2 * m[i][j]
          identity[k][j] -= factor2 * identity[i][j]
        }
      }
    }
    return identity
  }

  const X = vandermondeMatrix
  const XT = transpose(X)
  const XTX = multiply(XT, X)
  const XTy = multiply(XT, ySlice.map((y) => [y]))
  const coefficients = multiply(invert(XTX), XTy).map((row) => row[0])

  // Generate interpolated points for the given interpRangeX (linear ou log)
  const interpolatedX = interpRangeX
  const interpolatedY = interpRangeX.map(x =>
    coefficients.reduce((sum, coeff, i) => sum + coeff * Math.pow(x, i), 0)
  )

  return { coefficients, interpolatedX, interpolatedY }
}