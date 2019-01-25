const voies = require('./lib/voies')
const {extractNumeroSuffixe, rewriteSuffixes} = require('./lib/numeros')
const {createMatcher} = require('./lib/fantoir-match')
const bal = require('./lib/bal')

module.exports = {
  ...voies,
  ...bal,
  rewriteSuffixes,
  createFantoirMatcher: createMatcher,
  extractNumeroSuffixe
}
