const {chain} = require('lodash')

const POSITION_TYPES_PRIORITY = {
  entrée: 10,
  bâtiment: 8,
  'cage d’escalier': 7,
  logement: 6,
  'service technique': 5,
  'délivrance postale': 3,
  parcelle: 2,
  segment: 1
}

function getPositionPriorityByType(type) {
  if (!type) {
    return 0
  }

  return POSITION_TYPES_PRIORITY[type] || 0
}

function extractNumeroSuffixe(numeroComplet) {
  const result = String(numeroComplet).match(/^(\d+)(.*)$/i)
  if (!result) {
    throw new Error('numeroComplet non valide')
  }

  const suffixe = result[2].trim()
  return {numero: result[1], suffixe}
}

const MAPPING_SUFFIXE = {
  b: 'bis',
  t: 'ter',
  q: 'quater'
}

function rewriteSuffixes(adresses) {
  return chain(adresses)
    .groupBy('numero')
    .forEach(adressesNumero => {
      if (adressesNumero.length > 1) {
        const variantes = chain(adressesNumero)
          .filter(a => a.suffixe)
          .map('suffixe')
          .uniq()
          .value()

        if (variantes.every(v => v in MAPPING_SUFFIXE)) {
          adressesNumero.forEach(adresse => {
            if (adresse.suffixe) {
              adresse.suffixe = MAPPING_SUFFIXE[adresse.suffixe]
            }
          })
        }
      }
    })
    .value()
}

module.exports = {extractNumeroSuffixe, rewriteSuffixes, getPositionPriorityByType}
