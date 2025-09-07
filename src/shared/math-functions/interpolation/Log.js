/**
 * Logarithmic Spline Interpolation (Cubic Spline in log(x))
 * It works for any graph, as long as x > 0.
 *
 * @param {number[]} xSlice - Array x 
 * @param {number[]} ySlice - Array y
 * @param {number[]} interpRangeX - Array x to interpolate
 * 
 * @returns {{interpolatedX: number[], interpolatedY: number[]}}
 * 
 * Behavior:
 * - xSlice and interpRangeX are in linear scale, ySlice is in linear scale.
 * 
 * @throws Will throw an error if the input arrays are empty or contain non-positive x values.
 * 
 * @note The function performs a cubic spline interpolation in the logarithmic domain of x.
 *       The output includes the interpolated x and y values, as well as the logarithmic knots and spline coefficients.
 */
export const calculateLogSplineInterpolation = (xSlice, ySlice, interpRangeX) => {
  if (!xSlice.length || !ySlice.length) throw new Error('Empty interval for Logarithmic Spline')
  if (xSlice.some(x => x <= 0) || interpRangeX.some(x => x <= 0)) {
    throw new Error('Logarithmic spline requires x > 0')
  }
  const logX = xSlice.map(Math.log10)
  const interpLogX = interpRangeX.map(Math.log10)

  const n = logX.length
  const a = ySlice.slice()
  const h = Array(n - 1).fill(0).map((_, i) => logX[i + 1] - logX[i])
  const alpha = Array(n - 1).fill(0)
  for (let i = 1; i < n - 1; i++) {
    alpha[i] = (3 / h[i]) * (a[i + 1] - a[i]) - (3 / h[i - 1]) * (a[i] - a[i - 1])
  }
  const l = Array(n).fill(1)
  const mu = Array(n).fill(0)
  const z = Array(n).fill(0)
  for (let i = 1; i < n - 1; i++) {
    l[i] = 2 * (logX[i + 1] - logX[i - 1]) - h[i - 1] * mu[i - 1]
    mu[i] = h[i] / l[i]
    z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i]
  }
  const c = Array(n).fill(0)
  const b = Array(n - 1).fill(0)
  const d = Array(n - 1).fill(0)
  for (let j = n - 2; j >= 0; j--) {
    c[j] = z[j] - mu[j] * c[j + 1]
    b[j] = (a[j + 1] - a[j]) / h[j] - h[j] * (c[j + 1] + 2 * c[j]) / 3
    d[j] = (c[j + 1] - c[j]) / (3 * h[j])
  }

  const interpolatedY = interpLogX.map(xi => {
    let i = logX.findIndex((x, idx) => xi < x && idx > 0) - 1
    if (i < 0) i = logX.length - 2
    if (xi < logX[0]) i = 0
    if (xi > logX[n - 1]) i = n - 2
    const dx = xi - logX[i]
    return a[i] + b[i] * dx + c[i] * dx * dx + d[i] * dx * dx * dx
  })

  return {
    interpolatedX: interpRangeX,
    interpolatedY,
    logKnots: logX,
    coefficients: {
      a: a.slice(0, n - 1),
      b,
      c: c.slice(0, n - 1),
      d,
    }
  }
}