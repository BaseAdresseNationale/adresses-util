const {deburr} = require('lodash')
const phonetic = require('talisman/phonetics/french/phonetic')
const {extractSignificantWords} = require('./words')

function normalizeBase(str) {
  return deburr(str).toLowerCase()
}

function normalize(str) {
  return extractSignificantWords(normalizeBase(str)).join(' ')
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

function slugify(str) {
  return extractSignificantWords(normalizeBase(str)).join('-')
}

module.exports = {phonetizeWords, phoneticOrSame, normalizeBase, slugify, normalize}
