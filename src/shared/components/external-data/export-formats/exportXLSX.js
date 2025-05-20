import * as XLSX from 'xlsx'

/**
 * Function for export in XLSX (Excel Default)
 * 
 * @param {dataset} ds                  - Dataset to be saved
 * @param {String} baseName             - Name of the dataset
 * @param {Boolean} includeInterpPoints - Include interpolation points
 */
export const exportXLSX = (ds, baseName, includeInterpPoints = true) => {
  const wb = XLSX.utils.book_new()
  const ws = {}
  const merges = []

  ws['A1'] = { v: 'X' }
  ws['B1'] = { v: 'Y' }
  ws['C1'] = { v: '' }
  ws['D1'] = {
    v: 'Parameters',
    s: { alignment: { horizontal: 'center', vertical: 'center' } }
  }
  merges.push({ s: { r: 0, c: 3 }, e: { r: 0, c: 4 } })

  let rowPtr = 2
  Object.entries(ds.params || {}).forEach(([k, v]) => {
    ws[`D${rowPtr}`] = { v: k }
    ws[`E${rowPtr}`] = { v: v }
    rowPtr++
  })

  const main = Array.isArray(ds.data) ? ds.data[0] : null
  const xs = main?.x || []
  const ys = main?.y || []
  const dataStart = 2
  xs.forEach((x, i) => {
    const r = dataStart + i
    ws[`A${r}`] = { v: x }
    ws[`B${r}`] = { v: ys[i] !== undefined ? ys[i] : '' }
  })

  ws['F1'] = { v: '' }
  ws['F1'].s = { alignment: { horizontal: 'center', vertical: 'center' } }

  const areaColStart = 6 // G index (0-based)
  const areaColEnd = 7   // H index
  
  ws['G1'] = { v: 'Areas', s: { alignment: { horizontal: 'center', vertical: 'center' } } }
  merges.push({ s: { r: 0, c: areaColStart }, e: { r: 0, c: areaColEnd } })
  ws['G2'] = { v: 'Area' }
  ws['H2'] = { v: 'Value' }
  const areas = Array.isArray(ds.areas) ? ds.areas : []
  let areaRowPtr = 3
  areas.forEach((area, idx) => {
    ws[`G${areaRowPtr}`] = { v: `Area ${idx + 1}` }
    ws[`H${areaRowPtr}`] = { v: area.value }
    areaRowPtr++
    ws[`G${areaRowPtr}`] = { v: 'Start' }
    ws[`H${areaRowPtr}`] = { v: area.start }
    areaRowPtr++
    ws[`G${areaRowPtr}`] = { v: 'End' }
    ws[`H${areaRowPtr}`] = { v: area.end }
    areaRowPtr++
    areaRowPtr++
  })

  ws['I1'] = { v: '' }

  const interps = Array.isArray(ds.interpolations) ? ds.interpolations : []

  interps.forEach((interp, idx) => {
    const startCol = 9 + idx * 3
    const colX = XLSX.utils.encode_col(startCol)
    const colY = XLSX.utils.encode_col(startCol + 1)

    const title =
      interp.type === 'polinomial'
        ? `Polinomial (ord ${interp.order}) (${interp.typeCalculate})`
        : interp.type === 'gaussiana'
          ? `Gaussian (${interp.typeCalculate})`
          : interp.type || 'Interp'
    ws[`${colX}1`] = { v: title, s: { alignment: { horizontal: 'center', vertical: 'center' } } }
    merges.push({ s: { r: 0, c: startCol }, e: { r: 0, c: startCol + 1 } })

    let pStr = ''
    if (interp.type === 'polinomial' && Array.isArray(interp.coefficients)) {
      pStr = interp.coefficients.map((c, i) => `a${i}: ${c}`).join(' ')
    } else if (interp.type === 'gaussiana') {
      pStr = `σ: ${interp.sigma} μ: ${interp.mu} A: ${interp.amplitude}`
    }
    if (includeInterpPoints) {
      ws[`${colX}2`] = { v: pStr, s: { alignment: { horizontal: 'center', vertical: 'center' } } }
      merges.push({ s: { r: 1, c: startCol }, e: { r: 1, c: startCol + 1 } })
    } else {
      let paramLines = []
      if (interp.type === 'polinomial' && Array.isArray(interp.coefficients)) {
        paramLines = interp.coefficients.map((c, i) => `a${i}: ${c}`)
      } else if (interp.type === 'gaussiana') {
        paramLines = [`σ: ${interp.sigma}`, `μ: ${interp.mu}`, `A: ${interp.amplitude}`]
      }
      paramLines.forEach((line, idx) => {
        ws[`${colX}${2 + idx}`] = { v: line }
      })
    }

    const block = interp.data?.[0] || {}
    const bxs = Array.isArray(block.x) ? block.x : []
    const bys = Array.isArray(block.y) ? block.y : []
    if (includeInterpPoints) {
      bxs.forEach((xv, j) => {
        const r = dataStart + j + 1
        ws[`${colX}${r}`] = { v: xv }
        ws[`${colY}${r}`] = { v: bys[j] !== undefined ? bys[j] : '' }
      })
    }
  })

  ws['!merges'] = merges
  const lastCol = 9 + interps.length * 3 - 1
  const lastRow = Math.max(
    dataStart + xs.length - 1,
    dataStart + 1 + Math.max(0, ...interps.map(i => i.data?.[0]?.x?.length || 0))
  )
  ws['!ref'] = `A1:${XLSX.utils.encode_col(lastCol)}${lastRow}`

  // Column widths
  ws['!cols'] = [
    { wch: 12 }, // A
    { wch: 12 }, // B
    { wch: 2 },  // C
    { wch: 18 }, // D
    { wch: 15 }, // E
    { wch: 2 },  // F 
    { wch: 6 },  // G Area label
    { wch: 22 }, // H Area value
    { wch: 2 },  // I
    ...interps.flatMap(() => [{ wch: 22 }, { wch: 22 }, { wch: 2 }])
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Dataset')
  XLSX.writeFile(wb, `${baseName}.xlsx`)
}