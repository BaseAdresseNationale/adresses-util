const bluebird = require('bluebird')
const {groupBy, first, memoize} = require('lodash')
const {createMatcher} = require('../../fantoir-match')

async function recomputeCodesVoies(adresses) {
  const adressesCommunes = Object.values(groupBy(adresses, 'codeCommune'))
  await bluebird.mapSeries(adressesCommunes, async adressesCommune => {
    const {codeCommune} = first(adressesCommune)
    const fantoir = await createMatcher(codeCommune)
    const findCodeVoie = memoize((nomVoie => fantoir.findCodeVoie(nomVoie)))
    adressesCommune.forEach(adresse => {
      adresse.originalCodeVoie = adresse.codeVoie
      adresse.codeVoie = findCodeVoie(adresse.nomVoie) || adresse.originalCodeVoie
    })
  })
}

module.exports = recomputeCodesVoies
