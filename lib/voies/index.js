const leven = require('leven')
const {extractSignificantWords} = require('./words')
const {normalizeBase, phonetizeWords, phoneticOrSame, slugify, normalize} = require('./normalize')
const {overlap} = require('./overlap')
const {computeAverageIntersectDistance} = require('./geo-intersect')
const beautify = require('./beautify')

function compareStringFuzzy(strA, strB, fuzziness = 1) {
  return leven(strA, strB) <= fuzziness
}

function compareNomVoieOverlap(nomVoieA, nomVoieB) {
  const nomVoieWordsA = extractSignificantWords(normalizeBase(nomVoieA))
  const nomVoieWordsB = extractSignificantWords(normalizeBase(nomVoieB))
  if (overlap(nomVoieWordsA, nomVoieWordsB)) {
    return true
  }

  if (nomVoieWordsA.length === 1 || nomVoieWordsB.length === 1) {
    return false
  }

  return overlap(nomVoieWordsA.slice(1), nomVoieWordsB.slice(1))
}

function compareNomVoieFuzzy(nomVoieA, nomVoieB) {
  const nomVoieWordsA = extractSignificantWords(normalizeBase(nomVoieA))
  const nomVoieWordsB = extractSignificantWords(normalizeBase(nomVoieB))
  if (compareStringFuzzy(nomVoieWordsA.join(' '), nomVoieWordsB.join(' '))) {
    return true
  }

  if (nomVoieWordsA.length === 1 || nomVoieWordsB.length === 1) {
    return false
  }

  return compareStringFuzzy(nomVoieWordsA.slice(1).join(' '), nomVoieWordsB.slice(1).join(' '))
}

function createPseudoCodeVoieGenerator() {
  let seq = 0

  return {
    create() {
      const str = String(++seq).padStart(4, '0')
      if (str.charAt(0) === '0') {
        return 'X' + str.substr(1)
      }

      if (str.charAt(0) === '1') {
        return 'Y' + str.substr(1)
      }

      if (str.charAt(0) === '2') {
        return 'Z' + str.substr(1)
      }

      throw new Error('Limite pseudoCodeVoie atteinte')
    }
  }
}

module.exports = {
  compareNomVoieOverlap,
  compareNomVoieFuzzy,
  createPseudoCodeVoieGenerator,
  phonetizeWords,
  phoneticOrSame,
  slugify,
  normalize,
  computeAverageIntersectDistance,
  beautify,
  overlap,
  extractSignificantWords,
  normalizeBase
}
