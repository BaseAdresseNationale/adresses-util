/* eslint camelcase: off */
const {promisify} = require('util')
const {createWriteStream} = require('fs')
const {createGzip} = require('zlib')
const {ensureFile} = require('fs-extra')
const pipe = promisify(require('mississippi').pipe)
const intoStream = require('into-stream')
const csvWriter = require('csv-write-stream')
const proj = require('@etalab/project-legal')
const {buildCleInterop} = require('../../bal')

function roundCoordinate(coordinate, precision = 6) {
  return parseFloat(coordinate.toFixed(precision))
}

function adresseToRow(a) {
  const projectedCoords = proj(a.position.coordinates)
  return {
    cle_interop: buildCleInterop(a),
    numero: a.numero,
    suffixe: a.suffixe,
    voie_nom: a.nomVoie,
    commune_nom: a.nomCommune,
    commune_code: a.codeCommune,
    source: a.sources.join(','),
    long: roundCoordinate(a.position.coordinates[0]),
    lat: roundCoordinate(a.position.coordinates[1]),
    x: projectedCoords[0],
    y: projectedCoords[1]
  }
}

async function writeData(path, adresses) {
  await ensureFile(path)
  const steps = [
    intoStream.obj(adresses.map(adresseToRow)),
    csvWriter({separator: ';'})
  ]
  if (path.endsWith('.gz')) {
    steps.push(createGzip())
  }
  steps.push(createWriteStream(path))
  await pipe(...steps)
}

module.exports = writeData