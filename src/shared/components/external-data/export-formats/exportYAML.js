import YAML from 'js-yaml'

/**
 * Function to remove methods from datasets
 * 
 * @param {dataset} obj
 * @returns             - treated dataset
 */
const removeFunctions = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(removeFunctions)
  } else if (obj && typeof obj === 'object') {
    const result = {}
    for (const key in obj) {
      const value = obj[key]
      if (typeof value !== 'function' && typeof value !== 'undefined') {
        result[key] = removeFunctions(value)
      }
    }
    return result
  }
  return obj
}

/**
 * Function for export in YAML
 * 
 * @param {dataset} ds                  - Dataset to be saved
 * @param {String} baseName             - Name of the dataset
 */
export const exportYAML = (ds, baseName) => {
  // Convert the entire dataset to YAML
  const cleanDs = removeFunctions(ds)
  const yamlStr = YAML.dump(cleanDs, {
    noRefs: true,
    sortKeys: false,
  })

  const blob = new Blob([yamlStr], { type: 'application/x-yaml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${baseName}.yaml`
  link.click()
}