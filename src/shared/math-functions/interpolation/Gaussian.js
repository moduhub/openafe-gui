/**
 * Calculates Gaussian interpolation (RBF with Gaussian nucleus).
 *
 * @param {[number,number]} points          Índices [idx1, idx2] do corte.
 * @param {Array} datasets                  Array de datasets (cada um com .data[0].x / .y).
 * @param {number} datasetSelected          Índice do dataset a usar.
 * @param {{min: number, max: number}} range Intervalo de geração de pontos.
 * @returns {{weights: number[], interpolatedX: number[], interpolatedY: number[]}}
 */
export const calculateGaussianInterpolation = (
  points,
  datasets,
  datasetSelected,
  range
) => {
  const xValues = datasets[datasetSelected].data[0].x
  const yValues = datasets[datasetSelected].data[0].y

  let [idx1, idx2] = points
  if (idx1 > idx2) [idx1, idx2] = [idx2, idx1]

  const xSlice = xValues.slice(idx1, idx2 + 1)
  const ySlice = yValues.slice(idx1, idx2 + 1)
  if (xSlice.length === 0) {
    throw new Error('Intervalo vazio para Gaussiana')
  }

  // Amplitude A pelo pico, mu pela média ponderada
  const A = Math.max(...ySlice)
  const sumY = ySlice.reduce((s, y) => s + y, 0)
  const mu = sumY
    ? xSlice.reduce((s, x, i) => s + x * ySlice[i], 0) / sumY
    : (xSlice[0] + xSlice[xSlice.length - 1]) / 2

  // Grid search para sigma ótimo (minimizar SSE)
  const span = xSlice[xSlice.length - 1] - xSlice[0] || 1
  const sigmaMin = span / 100
  const sigmaMax = span * 2
  const steps = 100
  let bestSigma = sigmaMin
  let minError = Infinity

  for (let k = 0; k <= steps; k++) {
    const sigma = sigmaMin + (sigmaMax - sigmaMin) * (k / steps)
    let error = 0
    for (let i = 0; i < xSlice.length; i++) {
      const diff = xSlice[i] - mu
      const g = A * Math.exp(-diff * diff / (2 * sigma * sigma))
      error += (g - ySlice[i]) ** 2
    }
    if (error < minError) {
      minError = error
      bestSigma = sigma
    }
  }

  // Gera a curva Gaussiana usando sigma ótimo
  const interpolatedX = []
  const interpolatedY = []
  for (let x = range.min; x <= range.max; x += 1) {
    interpolatedX.push(x)
    const diff = x - mu
    interpolatedY.push(A * Math.exp(-diff * diff / (2 * bestSigma * bestSigma)))
  }

  return { mu, sigma: bestSigma, amplitude: A, interpolatedX, interpolatedY }
}