const beautify = require('./lib/voies/beautify')
const {overlap} = require('./lib/voies/overlap')
const {extractSignificantWords} = require('./lib/voies/words')
const {normalizeBase, phonetizeWords} = require('./lib/voies/normalize')
const {rewriteSuffixes} = require('./lib/numeros/suffixes')
const {createMatcher} = require('./lib/fantoir-match')

function buildCleInterop({codeCommune, codeVoie, numero, suffixe}) {
  return `${codeCommune}_${codeVoie}_${numero.padStart(5, '0')}${suffixe ? '_' + suffixe : ''}`.toLowerCase()
}

module.exports = {
  beautify,
  overlap,
  extractSignificantWords,
  normalizeBase,
  phonetizeWords,
  buildCleInterop,
  rewriteSuffixes,
  createFantoirMatcher: createMatcher
}
