function buildCleInterop({codeCommune, codeVoie, numero, suffixe}) {
  return `${codeCommune}_${codeVoie}_${numero.padStart(5, '0')}${suffixe ? '_' + suffixe : ''}`.toLowerCase()
}

module.exports = {buildCleInterop}
