import Plotly from 'plotly.js-dist'

export const exportJPEG = async (
  baseName,
  width = 800, height = 600, 
  dpi = 96
) => {
  width = parseInt(width, 10)
  height = parseInt(height, 10)
  dpi = parseInt(dpi, 10)
  
  const chartDiv = document.querySelector('[data-plotly]') || document.querySelector('.js-plotly-plot')
  if (!chartDiv) {
    alert('Gráfico não encontrado para exportação!')
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
    alert('Erro ao exportar gráfico: ' + e.message)
  }
}
