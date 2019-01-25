
const {outputJson} = require('fs-extra')
const {flatten, chain, pick, groupBy} = require('lodash')
const consolidateVoies = require('./processing/consolidate-voies')

const SOURCES_LOADERS = {
  ban: require('./sources/ban'),
  bano: require('./sources/bano'),
  bal: require('./sources/bal'),
  cadastre: require('./sources/cadastre'),
  ftth: require('./sources/ftth')
}

async function merge(options) {
  const {departement, sources} = options

  const incomingAdresses = sources.map(s => {
    return SOURCES_LOADERS[s](options[`${s}Path`])
  })

  const adresses = flatten(await Promise.all(incomingAdresses)).filter(a => {
    // Suppression des adresses sans numéro
    if (!a.numero) {
      return false
    }
    // Suppression des pseudo-adresses
    const parsedNumero = Number.parseInt(a.numero, 10)
    if (parsedNumero === 0 || parsedNumero > 5000) {
      return false
    }
    return true
  })

  const voies = []

  const adressesCommunes = groupBy(adresses, 'codeCommune')

  Object.keys(adressesCommunes).forEach(codeCommune => {
    consolidateVoies(adressesCommunes[codeCommune]).forEach(v => voies.push(v))
  })

  await outputJson(`dist/adresses-ouvertes-${departement}.geojson`, {
    type: 'FeatureCollection',
    features: chain(voies)
      .map(voie => voie.numeros.map(n => ({
        ...voie,
        ...n
      })))
      .flatten()
      .filter(a => a.position)
      .map(a => ({
        type: 'Feature',
        properties: pick(a, 'numero', 'suffixe', 'codeVoie', 'nomVoie', 'codeCommune', 'nomCommune', 'sources', 'positionSource', 'positionType', 'id'),
        geometry: a.position
      }))
  })
}

module.exports = merge
