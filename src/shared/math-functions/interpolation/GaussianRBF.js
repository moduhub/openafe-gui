/**
 * Calculates Gaussian interpolation (RBF with Gaussian nucleus),
 *
 * @param {[number,number]} points            - Indices [idx1, idx2] of the cut
 * @param {Array} datasets                    - Array of datasets (each with .data[0].x / .y)
 * @param {number} datasetSelected            - Index of the dataset to use
 * @param {{min: number, max: number}} range  - Generation point interval
 * 
 * @returns {{mu: number, sigma: number, amplitude: number, interpolatedX: number[], interpolatedY: number[]}}
 */
export const calculateGaussianInterpolationRBF = (
  points,
  datasets,
  datasetSelected,
  range
) => {
  const xValues = datasets[datasetSelected].data[0].x
  const yValues = datasets[datasetSelected].data[0].y

  let [i1, i2] = points
  if (i1 > i2) [i1, i2] = [i2, i1]

  const xSlice = xValues.slice(i1, i2 + 1)
  const ySlice = yValues.slice(i1, i2 + 1)
  if (!xSlice.length) throw new Error('Intervalo vazio para Gaussiana')

  // Original signal of the peak and absolute values
  const absY = ySlice.map(y => Math.abs(y))
  const peakIdx = absY.indexOf(Math.max(...absY))
  const originalSign = Math.sign(ySlice[peakIdx]) || 1  // se zero, assume positivo

  // Estimation of A and mu using absY
  const A = absY[peakIdx]
  const sumAbsY = absY.reduce((s,y) => s + y, 0)
  const mu = sumAbsY
    ? xSlice.reduce((s, x, i) => s + x * absY[i], 0) / sumAbsY
    : (xSlice[0] + xSlice[xSlice.length - 1]) / 2

  // Optimal sigma search (SSE between Gaussian of absY and absY)
  const span = xSlice[xSlice.length - 1] - xSlice[0] || 1
  const [σmin, σmax, steps] = [span / 100, span * 2, 100]
  let bestSigma = σmin
  let minErr = Infinity

  for (let k = 0; k <= steps; k++) {
    const σ = σmin + (σmax - σmin) * (k / steps)
    let err = 0
    for (let i = 0; i < xSlice.length; i++) {
      const d = xSlice[i] - mu
      const g = A * Math.exp(-d * d / (2 * σ * σ))
      err += (g - absY[i]) ** 2
    }
    if (err < minErr) {
      minErr = err
      bestSigma = σ
    }
  }

  // Generates interpolation in (range.min … range.max)
  const interpolatedX = []
  const interpolatedY = []
  for (let x = range.min; x <= range.max; x += 1) {
    interpolatedX.push(x)
    const d = x - mu
    interpolatedY.push(originalSign * A * Math.exp(-d * d / (2 * bestSigma * bestSigma)))
  }

  // Detect and apply horizontal mirroring, if μ is to the left of the center
  const sliceMid = (xSlice[0] + xSlice[xSlice.length - 1]) / 2
  if (mu < sliceMid) {
    for (let j = 0; j < interpolatedX.length; j++) {
      interpolatedX[j] = sliceMid - (interpolatedX[j] - sliceMid)
    }
  }

  return {
    mu,
    sigma: bestSigma,
    amplitude: A,
    interpolatedX,
    interpolatedY
  }
}