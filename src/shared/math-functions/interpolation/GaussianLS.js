/**
 * Fits a Gaussian using Least Squares (linearizing in log)
 *
 * @param {[number,number]} points         - Indices [i1, i2] to slice the peak
 * @param {Array} datasets                 - Dataset with .data[0].x and .y
 * @param {number} datasetSelected         - Which dataset to use
 * @param {{min:number, max:number}} range - Interval to generate interpolation
 *
 * @returns {{mu:number, sigma:number, amplitude:number, interpolatedX:number[], interpolatedY:number[]}}
 */
export function calculateGaussianInterpolationLS(points, datasets, datasetSelected, range) {
  const xArr = datasets[datasetSelected].data[0].x
  const yArr = datasets[datasetSelected].data[0].y

  let [i1, i2] = points
  if (i1 > i2) [i1, i2] = [i2, i1]

  const xs = xArr.slice(i1, i2 + 1)
  const ys = yArr.slice(i1, i2 + 1)
  if (xs.length === 0) throw new Error('Intervalo vazio para ajuste gaussiano')

  // Working with absolute values and capturing the signal
  const absY = ys.map(y => Math.abs(y))
  const peakIdx = absY.indexOf(Math.max(...absY))
  const originalSign = Math.sign(ys[peakIdx]) || 1

  // Linearize: u = ln(absY)
  const us = absY.map(y => Math.log(y))

  // Calculate sums for normal system
  let S0 = 0, Sx = 0, Sx2 = 0, Sx3 = 0, Sx4 = 0
  let Su = 0, Sxu = 0, Sx2u = 0
  const n = xs.length
  for (let i = 0; i < n; i++) {
    const x = xs[i]
    const u = us[i]
    const x2 = x*x, x3 = x2*x, x4 = x3*x
    S0   += 1
    Sx   += x
    Sx2  += x2
    Sx3  += x3
    Sx4  += x4
    Su   += u
    Sxu  += x * u
    Sx2u += x2 * u
  }

  // 3x3 matrix and independent term vector
  // [ [Sx4, Sx3, Sx2],   [a]   [Sx2u]
  //   [Sx3, Sx2, Sx ], * [b] = [Sxu ]
  //   [Sx2, Sx , S0 ] ] [c]   [Su   ]
  const M = [
    [Sx4, Sx3, Sx2],
    [Sx3, Sx2, Sx ],
    [Sx2, Sx , S0 ]
  ]
  const Y = [Sx2u, Sxu, Su]

  // Solve M * [a,b,c] = Y by Gaussian elimination
  function solveLinear3(A, B) {
    const m = A.map(row => row.slice())
    const y = B.slice()
    const N = 3
    for (let k = 0; k < N; k++) {
      let iMax = k
      for (let i = k+1; i < N; i++)
        if (Math.abs(m[i][k]) > Math.abs(m[iMax][k])) iMax = i
      [m[k], m[iMax]] = [m[iMax], m[k]]
      [y[k], y[iMax]] = [y[iMax], y[k]]
      const diag = m[k][k]
      for (let j = k; j < N; j++) m[k][j] /= diag
      y[k] /= diag
      for (let i = k+1; i < N; i++) {
        const factor = m[i][k]
        for (let j = k; j < N; j++) m[i][j] -= factor * m[k][j]
        y[i] -= factor * y[k]
      }
    }
    const X = Array(N).fill(0)
    for (let i = N - 1; i >= 0; i--) {
      let sum = y[i]
      for (let j = i+1; j < N; j++) sum -= m[i][j] * X[j]
      X[i] = sum / m[i][i]
    }
    return X
  }

  const [a, b, c] = solveLinear3(M, Y)

  // Extract original parameters
  const sigma = Math.sqrt(-1/(2*a))
  const mu    = b * (sigma*sigma)
  const A     = Math.exp(c + (mu*mu)/(2*sigma*sigma))

  // Generate interpolation in the requested range
  const interpolatedX = []
  const interpolatedY = []
  for (let x = range.min; x <= range.max; x += 1) {
    interpolatedX.push(x)
    const d = x - mu
    interpolatedY.push(originalSign * A * Math.exp(-d*d / (2*sigma*sigma)))
  }

  return { mu, sigma, amplitude: A, interpolatedX, interpolatedY }
}
