const {through, pipeline} = require('mississippi')
const parse = require('csv-parser')
const getStream = require('get-stream')
const decompress = require('decompress')
const toStream = require('buffer-to-stream')
const recomputeCodesVoies = require('../processing/recompute-codes-voies')
const removeStacked = require('../processing/remove-stacked')

function prepareData(addr, enc, next) {
  if (!addr.numero || !addr.nom_voie) {
    return next()
  }
  // Suppression des pseudo-numéros, approche grossière pour commencer.
  // Il existe des cas de 5000 légitimes, notamment pour la numérotation métrique et lorsque la voie comporte des 3000 ou 4000
  if (Number.parseInt(addr.numero, 10) > 5000) {
    return next()
  }
  const nomVoie = addr.nom_voie || addr.nom_ld
  const codeCommune = addr.code_insee
  const codeVoie = addr.id_fantoir

  const adresse = {
    source: 'ban',
    originalId: addr.id,
    numero: addr.numero,
    suffixe: addr.rep,
    nomVoie,
    codeVoie,
    codeCommune,
    nomCommune: addr.nom_commune,
    codePostal: addr.code_post || undefined,
    licence: 'lgp'
  }
  if (addr.lat && addr.lon) {
    adresse.position = {
      type: 'Point',
      coordinates: [parseFloat(addr.lon), parseFloat(addr.lat)]
    }
  }
  next(null, adresse)
}

async function load(path) {
  const files = await decompress(path)
  const csvFile = files.find(f => f.path.endsWith('csv'))
  const adresses = await getStream.array(pipeline.obj(
    toStream(csvFile.data),
    parse({separator: ';'}),
    through.obj(prepareData)
  ))
  await recomputeCodesVoies(adresses)
  return removeStacked(adresses, 'ban')
}

module.exports = load