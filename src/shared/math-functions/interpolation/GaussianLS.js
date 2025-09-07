/**
 * @brief Fits a Gaussian using Least Squares (linearizing in log)
 *
 * @param {number[]} xSlice - Array of x values (interval recortado)
 * @param {number[]} ySlice - Array of y values (interval recortado)
 * @param {number[]} interpRangeX - Array of x values to generate interpolation (linear ou log)
 * @param {boolean} isBodeMod - Whether the data is in Bode modulus format (dB)
 *
 * @returns {{mu:number, sigma:number, amplitude:number, interpolatedX:number[], interpolatedY:number[]}}
 * 
 * Behavior:
 * - If isBodeMod is true, xSlice and interpRangeX are in Hz (log scale), ySlice is in dB.
 * - If isBodeMod is false, xSlice and interpRangeX are in linear scale, ySlice is in linear scale.
 *
 * @throws Will throw an error if the input arrays are empty or have insufficient points.
 * @throws Will throw an error if the input data is insufficient or if the fit is invalid.
 *
 * @note The function performs a Gaussian fit by linearizing the problem using logarithms.
 *       It handles both standard and Bode modulus (dB) data formats.
 *       The output includes the Gaussian parameters and interpolated values.
 */
export const calculateGaussianInterpolationLS = (
  xSlice, ySlice, 
  interpRangeX,
  isBodeMod = false
) => {
  if (!xSlice.length) throw new Error('Empty interval for Gaussian adjustment')
  if (xSlice.length < 3) throw new Error('Insufficient points for Gaussian adjustment')

  const n = xSlice.length

  let absY
  if (isBodeMod) {
    absY = ySlice.map(yDb => Math.max(Math.pow(10, yDb / 20), 1e-12))
  } else {
    absY = ySlice.map(y => Math.max(Math.abs(y), 1e-12))
  }

  const peakIdx = absY.indexOf(Math.max(...absY))
  const originalSign = isBodeMod ? 1 : (Math.sign(ySlice[peakIdx]) || 1)

  // u = ln(absY)
  const us = absY.map(y => Math.log(y))

  // === 2. Pre-processing of xSlice ===
  let xs = isBodeMod
    ? xSlice.map(x => Math.log10(x))
    : xSlice.slice()

  let normX = xs
  let meanX = 0
  let scaleX = 1
  if (isBodeMod) {
    meanX = xs.reduce((sum, val) => sum + val, 0) / n
    scaleX = Math.max(...xs) - Math.min(...xs) || 1
    normX = xs.map(x => (x - meanX) / scaleX)
  }

  // === 3. Calculation of sums ===
  let S0 = 0, Sx = 0, Sx2 = 0, Sx3 = 0, Sx4 = 0
  let Su = 0, Sxu = 0, Sx2u = 0

  for (let i = 0; i < n; i++) {
    const x = normX[i]
    const u = us[i]
    const x2 = x * x, x3 = x2 * x, x4 = x3 * x
    S0 += 1
    Sx += x
    Sx2 += x2
    Sx3 += x3
    Sx4 += x4
    Su += u
    Sxu += x * u
    Sx2u += x2 * u
  }

  const M = [
    [Sx4, Sx3, Sx2],
    [Sx3, Sx2, Sx],
    [Sx2, Sx, S0]
  ]
  const Y = [Sx2u, Sxu, Su]

  // === 4. Resolution of the linear system ===
  const solveLinear3 = (A, B) => {
    const m = A.map(row => row.slice())
    const y = B.slice()
    const N = 3
    for (let k = 0; k < N; k++) {
      let iMax = k
      for (let i = k + 1; i < N; i++)
        if (Math.abs(m[i][k]) > Math.abs(m[iMax][k])) iMax = i
      ;[m[k], m[iMax]] = [m[iMax], m[k]]
      ;[y[k], y[iMax]] = [y[iMax], y[k]]
      const diag = m[k][k]
      if (Math.abs(diag) < 1e-12) throw new Error('Sistema linear mal condicionado')
      for (let j = k; j < N; j++) m[k][j] /= diag
      y[k] /= diag
      for (let i = k + 1; i < N; i++) {
        const factor = m[i][k]
        for (let j = k; j < N; j++) m[i][j] -= factor * m[k][j]
        y[i] -= factor * y[k]
      }
    }
    const X = Array(N).fill(0)
    for (let i = N - 1; i >= 0; i--) {
      let sum = y[i]
      for (let j = i + 1; j < N; j++) sum -= m[i][j] * X[j]
      X[i] = sum
    }
    return X
  }

  const [a, b, c] = solveLinear3(M, Y)

  // === 5. Curvature check ===
  if (a >= 0) {
    throw new Error('Curvatura positiva: ajuste gaussiano inválido para esses dados')
  }

  // === 6. Extraction of parameters ===
  const sigma = Math.sqrt(-1 / (2 * a))
  const muNorm = b * sigma * sigma

  // Rescale to the original domain if it is BodeMod
  const mu = isBodeMod ? (muNorm * scaleX + meanX) : muNorm
  const muHz = isBodeMod ? Math.pow(10, mu) : mu

  const A = Math.exp(c + (muNorm * muNorm) / (2 * sigma * sigma))

  // === 7. Interpolation ===
  const interpolatedX = interpRangeX
  const interpolatedY = interpRangeX.map(x => {
    const xVal = isBodeMod ? Math.log10(x) : x
    const xNorm = isBodeMod ? (xVal - meanX) / scaleX : xVal
    const d = xNorm - muNorm
    let y = originalSign * A * Math.exp(-d * d / (2 * sigma * sigma))
    return isBodeMod ? 20 * Math.log10(Math.max(y, 1e-12)) : y
  })

  return {
    mu: muHz,
    sigma: isBodeMod ? sigma * scaleX * Math.log(10) * muHz : sigma,
    amplitude: A,
    interpolatedX,
    interpolatedY
  }
}
