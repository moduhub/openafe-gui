import * as XLSX from 'xlsx'

/**
 * Function for export in XLSX (Excel Default)
 * 
 * @param {dataset} ds                  - Dataset to be saved
 * @param {String} baseName             - Name of the dataset
 * @param {Boolean} includeInterpPoints - Include interpolation points
 */
export const exportXLSX = (ds, baseName, includeInterpPoints) => {

  console.log(includeInterpPoints)

  const wb = XLSX.utils.book_new()
  const ws = {}
  const merges = []

  if(ds.type === "CVW"){
    ws['A1'] = { v: 'X' }
    ws['B1'] = { v: 'Y' }
    ws['C1'] = { v: '' }
    ws['D1'] = { v: 'Parameters' }

    const main = Array.isArray(ds.data) ? ds.data[0] : null
    const xs = main?.x || []
    const ys = main?.y || []

    const dataStart = 2

    xs.forEach((x, i) => {
      const r = dataStart + i
      ws[`A${r}`] = { v: x }
      ws[`B${r}`] = { v: ys[i] !== undefined ? ys[i] : '' }
    })
    
    merges.push({ s: { r: 0, c: 3 }, e: { r: 0, c: 4 } })

    let rowPtr = 2
    Object.entries(ds.params || {}).forEach(([k, v]) => {
      ws[`D${rowPtr}`] = { v: k }
      ws[`E${rowPtr}`] = { v: v }
      rowPtr++
    })

    ws['F1'] = { v: '' }
    ws['F1'].s = { alignment: { horizontal: 'center', vertical: 'center' } }

    const areaColStart = 6 // G index (0-based)
    const areaColEnd = 7   // H index
    
    ws['G1'] = { v: 'Markers', s: { alignment: { horizontal: 'center', vertical: 'center', font: { bold: true } } } }
    merges.push({ s: { r: 0, c: areaColStart }, e: { r: 0, c: areaColEnd } })

    let areaRowPtr = 2
    const markers = Array.isArray(ds.markers) ? ds.markers : []
    markers.forEach((marker, idx) => {
      ws[`G${areaRowPtr}`] = { v: `Marker` }
      ws[`H${areaRowPtr}`] = { v: `${idx + 1}` }
      areaRowPtr++
      ws[`G${areaRowPtr}`] = { v: `Name` }
      ws[`H${areaRowPtr}`] = { v: marker.label }
      areaRowPtr++
      ws[`G${areaRowPtr}`] = { v: 'Symbol' }
      ws[`H${areaRowPtr}`] = { v: marker.symbol }
      areaRowPtr++
      ws[`G${areaRowPtr}`] = { v: 'X' }
      ws[`H${areaRowPtr}`] = { v: marker.x }
      areaRowPtr++
      ws[`G${areaRowPtr}`] = { v: 'Y' }
      ws[`H${areaRowPtr}`] = { v: marker.y }
      areaRowPtr++
      areaRowPtr++
    })

    areaRowPtr++
    ws[`G${areaRowPtr}`] = { v: 'Areas', s: { alignment: { horizontal: 'center', vertical: 'center', font: { bold: true } } } }
    merges.push({ s: { r: areaRowPtr - 1, c: areaColStart }, e: { r: areaRowPtr - 1, c: areaColEnd } })
    areaRowPtr++
    
    const areas = Array.isArray(ds.areas) ? ds.areas : []
    areas.forEach((area, idx) => {
      ws[`G${areaRowPtr}`] = { v: `Area` }
      ws[`H${areaRowPtr}`] = { v: `${idx + 1}` }
      areaRowPtr++
      ws[`G${areaRowPtr}`] = { v: `Value` }
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

      if(includeInterpPoints){
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
  else if (ds.type === "EIS") {
    console.log(ds)
    console.log("EIS")

    ws['A1'] = { v: 'Omega' }
    ws['B1'] = { v: '|Z|' }
    ws['C1'] = { v: 'Phase(°)' }
    ws['D1'] = { v: 'R{Z}' }
    ws['E1'] = { v: 'I{Z}' }

    const main = Array.isArray(ds.data) ? ds.data[0] : {}
    const omega = main.omega || []
    const modZ = main.modZ || []
    const angZ = main.angZ || []
    const realZ = main.realZ || []
    const imagZ = main.imagZ || []

    const dataStart = 2

    omega.forEach((ω, i) => {
      const r = dataStart + i
      ws[`A${r}`] = { v: typeof ω === 'number' ? Number(ω.toFixed(6)) : '' }
      ws[`B${r}`] = { v: typeof modZ[i] === 'number' ? Number(modZ[i].toFixed(6)) : '' }
      ws[`C${r}`] = { v: typeof angZ[i] === 'number' ? Number(angZ[i].toFixed(6)) : '' }
      ws[`D${r}`] = { v: typeof realZ[i] === 'number' ? Number(realZ[i].toFixed(6)) : '' }
      ws[`E${r}`] = { v: typeof imagZ[i] === 'number' ? Number(imagZ[i].toFixed(6)) : '' }
    })

    ws['F1'] = { v: '' }
    ws['F1'].s = { alignment: { horizontal: 'center', vertical: 'center' } }

    ws['G1'] = { v: 'Parameters' }
    const merges = []
    merges.push({ s: { r: 0, c: 6 }, e: { r: 0, c: 7 } }) // G1:H1

    let rowPtr = 2
    Object.entries(ds.params || {}).forEach(([k, v]) => {
      ws[`G${rowPtr}`] = { v: k }
      ws[`H${rowPtr}`] = { v: v }
      rowPtr++
    })

    ws['I1'] = { v: '' }
    ws['I1'].s = { alignment: { horizontal: 'center', vertical: 'center' } }

    ws['J1'] = { v: 'Markers', s: { alignment: { horizontal: 'center', vertical: 'center', font: { bold: true } } } }
    merges.push({ s: { r: 0, c: 9 }, e: { r: 0, c: 10 } }) // J1:K1


    let areaRowPtr = 2
    const markers = Array.isArray(ds.markers) ? ds.markers : []
    markers.forEach((marker, idx) => {
      ws[`J${areaRowPtr}`] = { v: 'Marker' }
      ws[`K${areaRowPtr}`] = { v: `${idx + 1} - ( ${marker.ref} )` }
      areaRowPtr++
      ws[`J${areaRowPtr}`] = { v: 'Name' }
      ws[`K${areaRowPtr}`] = { v: marker.label }
      areaRowPtr++
      ws[`J${areaRowPtr}`] = { v: 'Symbol' }
      ws[`K${areaRowPtr}`] = { v: marker.symbol }
      areaRowPtr++
      ws[`J${areaRowPtr}`] = { v: 'X' }
      ws[`K${areaRowPtr}`] = { v: marker.x }
      areaRowPtr++
      ws[`J${areaRowPtr}`] = { v: 'Y' }
      ws[`K${areaRowPtr}`] = { v: marker.y }
      areaRowPtr++
      areaRowPtr++
    })

    areaRowPtr++
    ws[`J${areaRowPtr}`] = {
      v: 'Areas',
      s: { alignment: { horizontal: 'center', vertical: 'center', font: { bold: true } } }
    }
    merges.push({ s: { r: areaRowPtr - 1, c: 9 }, e: { r: areaRowPtr - 1, c: 10 } })
    areaRowPtr++

    const areas = Array.isArray(ds.areas) ? ds.areas : []
    areas.forEach((area, idx) => {
      ws[`J${areaRowPtr}`] = { v: 'Area' }
      ws[`K${areaRowPtr}`] = { v: `${idx + 1} - ( ${area.ref} )` }
      areaRowPtr++
      ws[`J${areaRowPtr}`] = { v: 'Value' }
      ws[`K${areaRowPtr}`] = { v: area.value }
      areaRowPtr++
      ws[`J${areaRowPtr}`] = { v: 'Start' }
      ws[`K${areaRowPtr}`] = { v: area.start }
      areaRowPtr++
      ws[`J${areaRowPtr}`] = { v: 'End' }
      ws[`K${areaRowPtr}`] = { v: area.end }
      areaRowPtr++
      areaRowPtr++
    })

    ws['L1'] = { v: '' }
    ws['L1'].s = { alignment: { horizontal: 'center', vertical: 'center' } }

    const interps = Array.isArray(ds.interpolations) ? ds.interpolations : []

    console.log(interps)

    interps.forEach((interp, idx) => {
      const startCol = 12 + idx * 3 // M = 12
      const colX = XLSX.utils.encode_col(startCol)
      const colY = XLSX.utils.encode_col(startCol + 1)

      const title =
        interp.type === 'polinomial'
          ? `Polinomial (ord ${interp.order}) (${interp.typeCalculate}) - ${interp.ref}`
          : interp.type === 'gaussiana'
            ? `Gaussian (${interp.typeCalculate}) -  ${interp.ref}`
            : interp.type || 'Interp'

      ws[`${colX}1`] = { v: title, s: { alignment: { horizontal: 'center', vertical: 'center' } } }
      merges.push({ s: { r: 0, c: startCol }, e: { r: 0, c: startCol + 1 } })

      let pStr = ''
      if (interp.type === 'polinomial' && Array.isArray(interp.coefficients)) {
        pStr = interp.coefficients.map((c, i) => `a${i}: ${c}`).join(' ')
      } else if (interp.type === 'gaussiana') {
        pStr = `σ: ${interp.sigma} μ: ${interp.mu} A: ${interp.amplitude}`
      }

      ws[`${colX}2`] = { v: pStr, s: { alignment: { horizontal: 'center', vertical: 'center' } } }
      merges.push({ s: { r: 1, c: startCol }, e: { r: 1, c: startCol + 1 } })

      if(includeInterpPoints){
        const block = interp.data?.[0] || {}
        const bxs = Array.isArray(block.x) ? block.x : []
        const bys = Array.isArray(block.y) ? block.y : []
        bxs.forEach((xv, j) => {
          const r = dataStart + j + 1
          ws[`${colX}${r}`] = { v: xv }
          ws[`${colY}${r}`] = { v: bys[j] }
        })
      }
    })

    const lastCol = 12 + interps.length * 3 - 1
    const lastRow = Math.max(
      dataStart + omega.length - 1,
      areaRowPtr - 1,
      rowPtr - 1
    )

    ws['!ref'] = `A1:${XLSX.utils.encode_col(lastCol)}${lastRow}`
    ws['!merges'] = merges

    ws['!cols'] = [
      { wch: 12 }, // A - Omega
      { wch: 12 }, // B - |Z|
      { wch: 12 }, // C - Phase
      { wch: 12 }, // D - R{Z}
      { wch: 12 }, // E - I{Z}
      { wch: 2 },  // F - espaçamento
      { wch: 18 }, // G - param name
      { wch: 15 }, // H - param value
      { wch: 2 },  // I - espaçamento
      { wch: 6 },  // J - marker/area label
      { wch: 22 }, // K - marker/area value
      { wch: 2 },  // L - espaçamento
      ...interps.flatMap(() => [{ wch: 22 }, { wch: 22 }, { wch: 2 }])
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Dataset')
    XLSX.writeFile(wb, `${baseName}.xlsx`)
  }
  
}