const {chain} = require('lodash')

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

module.exports = {rewriteSuffixes}
