const {createReadStream} = require('fs')
const {createGunzip} = require('gunzip-stream')
const {through, pipeline} = require('mississippi')
const getStream = require('get-stream')
const {parse} = require('ndjson')
const recomputeCodesVoies = require('../processing/recompute-codes-voies')

function prepareData(addr, enc, next) {
  if (addr.numeroComplet.startsWith('X')) {
    return next()
  }

  const adresse = {
    source: 'cadastre',
    originalId: addr.id,
    numero: addr.numero,
    suffixe: addr.suffixe,
    nomVoie: addr.nomVoie,
    codeVoie: addr.id.substr(6, 4),
    codeCommune: addr.codeCommune,
    nomCommune: addr.nomCommune,
    pseudoNumero: addr.pseudoNumero,
    destination: [addr.destinationPrincipale],
    parcelles: addr.codesParcelles,
    position: addr.meilleurePosition ? addr.meilleurePosition.geometry : undefined,
    positionType: addr.meilleurePosition ? addr.meilleurePosition.type : 'aucune',
    licence: 'lov2'
  }
  next(null, adresse)
}

async function load(path) {
  const adresses = await getStream.array(pipeline.obj(
    createReadStream(path),
    createGunzip(),
    parse(),
    through.obj(prepareData)
  ))
  recomputeCodesVoies(adresses)
  return adresses
}

module.exports = load
