const {chain} = require('lodash')
const extractWords = require('talisman/tokenizers/words')
const writtenNumber = require('written-number')

function writeNumber(str) {
  return writtenNumber(str, {lang: 'fr'})
}

function replaceNumbers(word) {
  return word.match(/^\d+$/) ? extractWords(writeNumber(word)) : word
}

const STOP_WORDS = [
  'la',
  'le',
  'les',
  'l',
  'd',
  'du',
  'de',
  'des',
  'dos',
  'las',
  'los',
  'sur',
  'sous',
  'a',
  'par',
  'et',
  'au',
  'aux'
]

const EXPAND_FIRST_WORD_TABLE = {
  pl: 'place',
  av: 'avenue',
  bd: 'boulevard',
  sq: 'square',
  che: 'chemin',
  chem: 'chemin',
  rte: 'route',
  all: 'allee',
  pas: 'passage',
  vla: 'villa',
  imp: 'impasse',
  qu: 'quai',
  ham: 'hammeau',
  prt: 'porte',
  parv: 'parvis',
  lot: 'lotissement',
  sen: 'sente',
  r: 'rue',
  rle: 'ruelle',
  car: 'carrefour',
  mte: 'montee',
  ptte: 'placette',
  str: 'sentier',
  tsse: 'terrasse',
  snt: 'sente'
}

const EXPAND_WORD_TABLE = {
  st: 'saint',
  ste: 'sainte',
  gal: 'general',
  mal: 'marechal'
}

function removeLieuDit(words) {
  if (words.length <= 2) {
    return words
  }

  if (words[0] === 'lieu' && words[1] === 'dit') {
    return words.slice(2)
  }

  return words
}

function removeRue(words) {
  if (words.length === 1) {
    return words
  }

  if (words[0] === 'rue' && words.slice(1).some(w => w.endsWith('rue'))) {
    return words.slice(1)
  }

  return words
}

function extractSignificantWords(normalizedNomVoie) {
  const words = extractWords(normalizedNomVoie)
    .map((w, i) => {
      if (i !== 0) {
        if (w in EXPAND_WORD_TABLE) {
          return EXPAND_WORD_TABLE[w]
        }

        return w
      }

      if (w in EXPAND_FIRST_WORD_TABLE) {
        return EXPAND_FIRST_WORD_TABLE[w]
      }

      return w
    })

  return chain(removeLieuDit(removeRue(words)))
    .filter(w => !STOP_WORDS.includes(w))
    .map(replaceNumbers)
    .flatten()
    .value()
}

module.exports = {extractSignificantWords}
