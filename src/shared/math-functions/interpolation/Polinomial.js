export const calculatePolynomialInterpolation = (points, datasets, datasetSelected, degree, range) => {
  const xValues = datasets[datasetSelected].data[0].x
  const yValues = datasets[datasetSelected].data[0].y

  let [idx1, idx2] = points
  if (idx1 > idx2) [idx1, idx2] = [idx2, idx1] // Sort indices here

  const xSlice = xValues.slice(idx1, idx2 + 1)
  const ySlice = yValues.slice(idx1, idx2 + 1)

  const n = xSlice.length
  if (n < degree + 1) {
    throw new Error(`Insufficient points for degree ${degree} approximation.`)
  }

  // Build the Valdemort matrix
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
    const identity = matrix.map((row, i) =>
      row.map((_, j) => (i === j ? 1 : 0))
    )
    for (let i = 0; i < size; i++) {
      const factor = matrix[i][i]
      for (let j = 0; j < size; j++) {
        matrix[i][j] /= factor
        identity[i][j] /= factor
      }
      for (let k = 0; k < size; k++) {
        if (k === i) continue
        const factor2 = matrix[k][i]
        for (let j = 0; j < size; j++) {
          matrix[k][j] -= factor2 * matrix[i][j]
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

  // Generate interpolated points within the specified range
  const interpolatedX = []
  const interpolatedY = []
  for (let x = range.min; x <= range.max; x += 1) {
    interpolatedX.push(x)
    interpolatedY.push(
      coefficients.reduce((sum, coeff, i) => sum + coeff * Math.pow(x, i), 0)
    )
  }

  return { coefficients, interpolatedX, interpolatedY }
}