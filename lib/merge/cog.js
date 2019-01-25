const {keyBy} = require('lodash')
const departements = require('@etalab/cog/data/departements.json')
const communes = require('@etalab/cog/data/communes.json')

const communesIndex = keyBy(communes, 'code')
const departementsIndex = keyBy(departements, 'code')

function getCodesDepartements() {
  return Object.keys(departementsIndex)
}

function getNomCommune(codeCommune) {
  return communesIndex[codeCommune].nom
}

module.exports = {getCodesDepartements, getNomCommune}
