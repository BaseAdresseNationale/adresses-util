const {deburr} = require('lodash')
const phonetic = require('talisman/phonetics/french/phonetic')

function normalizeBase(str) {
  return deburr(str).toLowerCase()
}

function phoneticOrSame(word) {
  const result = phonetic(word)
  return result ? result.toLowerCase() : word
}

function phonetizeWords(significantWords) {
  return significantWords
    .map(phoneticOrSame)
    .join(' ')
}

module.exports = {phonetizeWords, phoneticOrSame, normalizeBase}
