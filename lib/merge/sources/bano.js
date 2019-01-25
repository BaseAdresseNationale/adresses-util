const {createReadStream} = require('fs')
const {createGunzip} = require('gunzip-stream')
const {through, pipeline} = require('mississippi')
const parse = require('csv-parser')
const getStream = require('get-stream')
const {extractNumeroSuffixe} = require('../../numeros')
const recomputeCodesVoies = require('../processing/recompute-codes-voies')

function prepareData(addr, enc, next) {
  const {numero, suffixe} = extractNumeroSuffixe(addr.numero)
  const codeCommune = addr.id.substr(0, 5)
  const codeVoie = addr.id.substr(5, 4)
  const adresse = {
    source: 'bano',
    originalId: addr.id,
    numero,
    suffixe,
    nomVoie: addr.voie,
    codeVoie,
    codeCommune,
    nomCommune: addr.nom_comm,
    codePostal: addr.code_post || undefined,
    extras: {
      source: addr.source
    },
    position: {
      type: 'Point',
      coordinates: [parseFloat(addr.lon), parseFloat(addr.lat)]
    },
    licence: 'odc-odbl'
  }
  next(null, adresse)
}

const COLUMNS = [
  'id',
  'numero',
  'voie',
  'code_post',
  'nom_comm',
  'source',
  'lat',
  'lon'
]

async function load(path) {
  const adresses = await getStream.array(pipeline.obj(
    createReadStream(path),
    createGunzip(),
    parse({separator: ',', headers: COLUMNS}),
    through.obj(prepareData)
  ))
  await recomputeCodesVoies(adresses)
  return adresses
}

module.exports = load
