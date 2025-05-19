/**
 * Function for export in CSV
 * 
 * @param {dataset} ds                  - Dataset to be saved
 * @param {String} baseName             - Name of the dataset
 * @param {Boolean} includeInterpPoints - Include interpolation points
 */
export const exportCSV = (ds, baseName, includeInterpPoints = true) => {
  const csvLines = []

  // Parameter section
  csvLines.push('Parameters')
  csvLines.push('key,value')
  Object.entries(ds.params || {}).forEach(([k, v]) => {
    const val = String(v).includes(',') ? `"${v}"` : v
    csvLines.push(`${k},${val}`)
  })
  csvLines.push('')

  // Main data section
  csvLines.push('Main Data')
  csvLines.push('x,y')
  const main = Array.isArray(ds.data) ? ds.data[0] : null
  const xs = main?.x || []
  const ys = main?.y || []
  xs.forEach((x, i) => {
    const xv = String(x).includes(',') ? `"${x}"` : x
    const yv = String(ys[i]).includes(',') ? `"${ys[i]}"` : ys[i]
    csvLines.push(`${xv},${yv}`)
  })
  csvLines.push(''); // ";" necessary to separate commands

  // Interpolation sections
  (Array.isArray(ds.interpolations) ? ds.interpolations : []).forEach((interp, idx) => {
    let title = interp.type || `Interp${idx}`
    if (interp.type === 'polinomial') {
      title = `Polinomial_ord${interp.order}_${interp.typeCalculate}`
    } else if (interp.type === 'gaussiana') {
      title = `Gaussian_${interp.typeCalculate}`
    }
    csvLines.push(`${title}`)

    let paramLine = ''
    if (interp.type === 'polinomial' && Array.isArray(interp.coefficients)) {
      paramLine = interp.coefficients.map((c, i) => `a${i}: ${c}`).join(', ')
    } else if (interp.type === 'gaussiana') {
      const { sigma, mu, amplitude } = interp
      paramLine = `sigma: ${sigma}, mu: ${mu}, A: ${amplitude}`
    }
    if (includeInterpPoints) {
      csvLines.push(`${paramLine}`)
    } else {
      if (interp.type === 'polinomial' && Array.isArray(interp.coefficients)) {
        interp.coefficients.forEach((c, i) => {
          csvLines.push(`a${i}: ${c}`)
        })
      } else if (interp.type === 'gaussiana') {
        csvLines.push(`sigma: ${interp.sigma}`)
        csvLines.push(`mu: ${interp.mu}`)
        csvLines.push(`A: ${interp.amplitude}`)
      }
    }
    if (includeInterpPoints) csvLines.push('x,y')

    const block = interp.data?.[0] || { x: [], y: [] }
    const bxs = Array.isArray(block.x) ? block.x : []
    const bys = Array.isArray(block.y) ? block.y : []
    if (includeInterpPoints) {
      bxs.forEach((xv, j) => {
        const xvEsc = String(xv).includes(',') ? `"${xv}"` : xv
        const yvEsc = String(bys[j]).includes(',') ? `"${bys[j]}"` : bys[j]
        csvLines.push(`${xvEsc},${yvEsc}`)
      })
    }
    csvLines.push('')
  })

  const csvContent = csvLines.join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${baseName}.csv`
  link.click()
}