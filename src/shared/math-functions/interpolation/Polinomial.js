export const calculatePolynomialInterpolation = (points, datasets, datasetSelected, degree) => {
  const xValues = datasets[datasetSelected].data[0].x;
  const yValues = datasets[datasetSelected].data[0].y;

  const [idx1, idx2] = points;
  const xSlice = xValues.slice(idx1, idx2 + 1);
  const ySlice = yValues.slice(idx1, idx2 + 1);

  const n = xSlice.length;
  if (n <= degree) {
    throw new Error("Insufficient points for the selected polynomial degree.");
  }

  // Build the Vandermonde matrix
  const vandermonde = xSlice.map(x => Array.from({ length: degree + 1 }, (_, i) => Math.pow(x, i)));

  // Solve for coefficients using Gaussian elimination
  const coefficients = gaussianElimination(vandermonde, ySlice);

  // Generate interpolated points
  const interpolatedX = xSlice;
  const interpolatedY = interpolatedX.map(x =>
    coefficients.reduce((sum, coeff, i) => sum + coeff * Math.pow(x, i), 0)
  );

  return { coefficients, interpolatedX, interpolatedY };
};

const gaussianElimination = (A, b) => {
  const n = A.length;
  for (let i = 0; i < n; i++) {
    // Make the diagonal element 1
    const factor = A[i][i];
    for (let j = 0; j < n; j++) {
      A[i][j] /= factor;
    }
    b[i] /= factor;

    // Make the other elements in the column 0
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = A[k][i];
        for (let j = 0; j < n; j++) {
          A[k][j] -= factor * A[i][j];
        }
        b[k] -= factor * b[i];
      }
    }
  }
  return b;
};