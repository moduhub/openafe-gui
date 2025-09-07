/**
 * Exports a dataset to CSV
 *
 * @param {Object} ds                   - Dataset to be exported
 * @param {String} baseName             - Name of the dataset
 * @param {Boolean} includeInterp       - Include Interpolations
 * @param {Boolean} includePointMarkers - Include points markers
 * @param {Boolean} includeAreaMarkers  - Include area markers
 */
export const exportCSV = (ds, baseName, includeInterp, includePointMarkers, includeAreaMarkers) => {

  const saveCSV = (name, lines) => {
    const content = lines.join('\r\n')
    const blob = new Blob([content], { type: 'text/csvcharset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
  }

  const csvLines = []

  const paramStr = Object.entries(ds.params || {}).map(([k, v]) => `${k}=${v}`).join(', ')
  const paramAdvancedStr = Object.entries(ds.params_e || {}).map(([k, v]) => `${k}=${v}`).join(', ')
  csvLines.push(`# ${baseName} ${paramStr ? ', ' + paramStr : ''} ${paramAdvancedStr ? ', ' + paramAdvancedStr : ''}`)

  if(ds.type === "CVW"){
    const main = Array.isArray(ds.data) ? ds.data[0] : null
    const xs = main?.x || []
    const ys = main?.y || []
    xs.forEach((x, i) => {
      const xEsc = String(x).includes(',') ? `"${x}"` : x
      const yEsc = String(ys[i]).includes(',') ? `"${ys[i]}"` : ys[i]
      csvLines.push(`${xEsc},${yEsc}`)
    })
  }
  else if(ds.type === "EIS"){
    const main = Array.isArray(ds.data) ? ds.data[0] : null
    const omega = main.omega || []
    const modZ = main.modZ || []
    const angZ = main.angZ || []
    const realZ = main.realZ || []
    const imagZ = main.imagZ || []
    omega.forEach((ω, i) => {
      const omegaEsc = String(ω).includes(',') ? `"${ω}"` : ω
      const modZEsc = String(modZ[i]).includes(',') ? `"${modZ[i]}"` : modZ[i]
      const angZEsc = String(angZ[i]).includes(',') ? `"${angZ[i]}"` : angZ[i]
      const realZEsc = String(realZ[i]).includes(',') ? `"${realZ[i]}"` : realZ[i]
      const imagZEsc = String(imagZ[i]).includes(',') ? `"${imagZ[i]}"` : imagZ[i]
      csvLines.push(`${omegaEsc},${modZEsc},${angZEsc},${realZEsc},${imagZEsc}`)
    })
  }

  saveCSV(`${baseName}.csv`, csvLines)

  const markers = Array.isArray(ds.markers) ? ds.markers : []
  const markerLines = []
  if (includePointMarkers && markers.length > 0) {
    markers.forEach(marker => {
      markerLines.push(`${marker.label}\n${marker.symbol}\n${marker.x},${marker.y}\n`)
    })
    saveCSV(`${baseName}_markers.csv`, markerLines)
  }

  const areas = Array.isArray(ds.areas) ? ds.areas : []
  if (includeAreaMarkers && areas.length > 0) {
    const areaLines = []
    areas.forEach(area => {
      areaLines.push(`${area.value}\n${area.start}\n${area.end}\n`)
    })
    saveCSV(`${baseName}_areas.csv`, areaLines)
  }

  const interps = Array.isArray(ds.interpolations) ? ds.interpolations : []
  if(includeInterp){
    interps.forEach((interp, idx) => {
      let title = interp.type || `interp${idx + 1}`
      let paramLine = ''

      if (interp.type === 'polinomial') {
        title = `Polinomial_ord${interp.order}_${interp.typeCalculate}`
        if (Array.isArray(interp.coefficients)) {
          paramLine = interp.coefficients.map((c, i) => `a${i}=${c}`).join(', ')
        }
      } else if (interp.type === 'gaussiana') {
        title = `Gaussian_${interp.typeCalculate}`
        const { sigma, mu, amplitude } = interp
        paramLine = `sigma=${sigma}, mu=${mu}, A=${amplitude}`
      }
      else if (interp.type === 'logspline'){
        title = `LogSpline_${interp.typeCalculate}`
        /* exceeds the memory cell size limit
        if (interp.coefficients) {
          const { a = [], b = [], c = [], d = [] } = interp.coefficients
          const fmt = arr => `[${arr.map(v => Number(v).toPrecision(6)).join(', ')}]`
          paramLine = `a=${fmt(a)}, b=${fmt(b)}, c=${fmt(c)}, d=${fmt(d)}`
        }*/
      }

      const interpLines = []
      interpLines.push(`# ${title}${paramLine ? ', ' + paramLine : ''}`)

      const block = interp.data?.[0] || { x: [], y: [] }
      const bxs = Array.isArray(block.x) ? block.x : []
      const bys = Array.isArray(block.y) ? block.y : []

      bxs.forEach((xv, j) => {
        const xEsc = String(xv).includes(',') ? `"${xv}"` : xv
        const yEsc = String(bys[j]).includes(',') ? `"${bys[j]}"` : bys[j]
        interpLines.push(`${xEsc},${yEsc}`)
      })

      saveCSV(`${baseName}_interp${idx + 1}.csv`, interpLines)
    })
  }
  
}