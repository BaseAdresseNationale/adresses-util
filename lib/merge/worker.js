const {callbackify, promisify} = require('util')
const {createWriteStream} = require('fs')
const {createGzip} = require('zlib')
const {flatten, chain, pick} = require('lodash')
const pipe = promisify(require('mississippi').pipe)
const intoStream = require('into-stream')
const {stringify} = require('JSONStream')
const merge = require('.')

const SOURCES_LOADERS = {
  ban: require('./sources/ban'),
  bano: require('./sources/bano'),
  bal: require('./sources/bal'),
  cadastre: require('./sources/cadastre'),
  ftth: require('./sources/ftth')
}

async function main(options) {
  const {departement, sources, licences} = options
  console.log(`Préparation du département ${departement}`)

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
    // Suppression des lignes dont la licence est refusée
    if (licences && !licences.includes(a.licence)) {
      return false
    }
    return true
  })

  const voies = merge(adresses)

  await writeGeoJson(
    `dist/adresses-ouvertes-${departement}.geojson.gz`,
    chain(voies)
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
      .value()
  )
}

const GEOJSON_OPEN = '{"type":"FeatureCollection","features":[\n'
const GEOJSON_CLOSE = '\n]}\n'
const GEOJSON_SEPARATOR = '\n,\n'

async function writeGeoJson(path, features) {
  await pipe(
    intoStream.obj(features),
    stringify(GEOJSON_OPEN, GEOJSON_SEPARATOR, GEOJSON_CLOSE),
    createGzip(),
    createWriteStream(path)
  )
}

module.exports = callbackify(main)
