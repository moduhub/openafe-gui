import Plotly from 'plotly.js-dist'

/**
 * @brief Export the current chart(s) as a JPEG image
 * 
 * @param {string} baseName - Base name for the exported file
 * @param {number} width - Width of the exported image in pixels
 * @param {number} height - Height of the exported image in pixels
 * @param {number} dpi - Dots per inch for the exported image
 * @param {string|string[]} chartTypes - Type or array of types of charts to export (e.g., 'bodeMod', 'bodeAng', 'nyquist')
 * 
 * Behavior:
 * - If multiple chart types are provided, it attempts to export them side by side (for Bode plots) or stacked (for Nyquist).
 * - If only one chart type is provided, it exports that single chart.
 * - If no chart type is specified, it exports the first available chart.
 * - The exported image has a white background for better visibility.
 * - The image is downloaded as a JPEG file named `${baseName}.jpeg`.
 */
export const exportJPEG = async (
  baseName,
  width = 800, height = 600, 
  dpi = 96,
  chartTypes 
) => {
  width = parseInt(width, 10)
  height = parseInt(height, 10)
  dpi = parseInt(dpi, 10)

  if (Array.isArray(chartTypes) && chartTypes.length > 1) {
    const bodeCharts = ['bodeMod', 'bodeAng'].filter(type => chartTypes.includes(type))
    const hasNyquist = chartTypes.includes('nyquist')

    const bodeImages = []
    for (const chartType of bodeCharts) {
      const chartDiv = document.querySelector(`[data-plotly][data-chart-type="${chartType}"]`)
      if (!chartDiv) continue
      // Salve o layout original
      const originalLayout = chartDiv.layout ? JSON.parse(JSON.stringify(chartDiv.layout)) : null
      // Defina fundo branco
      await Plotly.relayout(chartDiv, {
        'paper_bgcolor': 'white',
        'plot_bgcolor': 'white',
      })
      const imgUrl = await Plotly.toImage(chartDiv, { format: 'jpeg', width, height, scale: dpi / 96 })
      bodeImages.push(imgUrl)
      // Restaure o layout original
      if (originalLayout) {
        await Plotly.relayout(chartDiv, originalLayout)
      }
    }
    let nyquistImg = null
    if (hasNyquist) {
      const chartDiv = document.querySelector(`[data-plotly][data-chart-type="nyquist"]`)
      if (chartDiv) {
        const originalLayout = chartDiv.layout ? JSON.parse(JSON.stringify(chartDiv.layout)) : null
        await Plotly.relayout(chartDiv, {
          'paper_bgcolor': 'white',
          'plot_bgcolor': 'white',
        })
        nyquistImg = await Plotly.toImage(chartDiv, { format: 'jpeg', width, height: bodeImages.length > 0 ? height * bodeImages.length : height, scale: dpi / 96 })
        if (originalLayout) {
          await Plotly.relayout(chartDiv, originalLayout)
        }
      }
    }

    if (bodeImages.length === 0 && !nyquistImg) {
      alert('No chart found for export!')
      return
    }

    let canvasWidth = width
    let canvasHeight = height * bodeImages.length
    if (hasNyquist && bodeImages.length > 0) {
      canvasWidth = width * 2 
    }

    const canvas = document.createElement('canvas')
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    const ctx = canvas.getContext('2d')

    for (let i = 0; i < bodeImages.length; i++) {
      const img = new window.Image()
      img.src = bodeImages[i]
      await new Promise(resolve => {
        img.onload = () => {
          ctx.drawImage(img, 0, i * height, width, height)
          resolve()
        }
      })
    }

    if (nyquistImg && bodeImages.length > 0) {
      const img = new window.Image()
      img.src = nyquistImg
      await new Promise(resolve => {
        img.onload = () => {
          ctx.drawImage(img, width, 0, width, canvasHeight)
          resolve()
        }
      })
    } else if (nyquistImg) {
      const img = new window.Image()
      img.src = nyquistImg
      await new Promise(resolve => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height)
          resolve()
        }
      })
    }

    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/jpeg')
    link.download = `${baseName}.jpeg`
    link.click()
    return
  }

  // Exportação de gráfico único (já estava correto)
  let chartDiv
  const chartType = Array.isArray(chartTypes) ? chartTypes[0] : chartTypes
  if (chartType) {
    chartDiv = document.querySelector(`[data-plotly][data-chart-type="${chartType}"]`)
  }
  if (!chartDiv) {
    chartDiv = document.querySelector('[data-plotly]') || document.querySelector('.js-plotly-plot')
  }
  if (!chartDiv) {
    alert('Graph not found for export!')
    return
  }
  try {
    const originalLayout = chartDiv.layout ? JSON.parse(JSON.stringify(chartDiv.layout)) : {}

    await Plotly.relayout(chartDiv, {
      'paper_bgcolor': 'white',
      'plot_bgcolor': 'white',
    })

    const url = await Plotly.toImage(chartDiv, {
      format: 'jpeg',
      width,
      height,
      scale: dpi / 96
    })
    const link = document.createElement('a')
    link.href = url
    link.download = `${baseName}.jpeg`
    link.click()

    if (originalLayout) {
      await Plotly.relayout(chartDiv, originalLayout)
    }
  } catch (e) {
    alert('Error exporting graph: ' + e.message)
  }
}