/**
 * function for export in JSON
 * 
 * @param {dataset} ds                  - Dataset to be saved
 * @param {String} baseName             - Name of the dataset
 */
export const exportJSON = (ds, baseName) => {
  const blob = new Blob([JSON.stringify(ds, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${baseName}.json`
  link.click()
}