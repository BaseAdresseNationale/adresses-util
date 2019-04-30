const voies = require('./lib/voies')
const {extractNumeroSuffixe, rewriteSuffixes} = require('./lib/numeros')
const bal = require('./lib/bal')

module.exports = {
  ...voies,
  ...bal,
  rewriteSuffixes,
  extractNumeroSuffixe
}
