const Keyv = require('keyv')
const leven = require('leven')
const {maxBy, keyBy} = require('lodash')
const {parseBuffer} = require('@etalab/fantoir-parser')
const {overlap} = require('../voies/overlap')
const {extractSignificantWords} = require('../voies/words')
const {normalizeBase, phonetizeWords} = require('../voies/normalize')

if (!process.env.FANTOIR_DB_PATH) {
  throw new Error('La variable d’environnement FANTOIR_DB_PATH doit être renseignée')
}

const fantoirDatabase = new Keyv(`sqlite://${process.env.FANTOIR_DB_PATH}`)

async function getFantoirCommune(codeCommune) {
  const fantoirCommune = await fantoirDatabase.get(codeCommune)
  if (!fantoirCommune) {
    return []
  }

  const items = await parseBuffer(fantoirCommune)

  return items
    .filter(item => item.libelleVoieComplet !== 'RUE')
    .map(item => {
      return {
        ...item,
        ...(computeStringContext(item.libelleVoieComplet))
      }
    })
}

function computeStringContext(str) {
  const normalizedString = normalizeBase(str)
  const significantWords = extractSignificantWords(normalizedString)
  const significantWordsString = significantWords.join(' ')
  const phoneticString = phonetizeWords(significantWords)
  return {normalizedString, phoneticString, significantWords, significantWordsString}
}

function selectBestResult(results, ctx) {
  const activeResults = results.filter(r => !r.dateAnnulation)
  if (activeResults.length === 1) {
    return activeResults[0]
  }

  return maxBy(activeResults.length > 1 ? activeResults : results, r => {
    return -leven(ctx.normalizedString, r.normalizedString)
  })
}

async function createMatcher(codeCommune) {
  const fantoirCommune = await getFantoirCommune(codeCommune)
  const index = keyBy(fantoirCommune, 'codeRivoli')
  const stats = {
    significantWords: 0,
    phonetic: 0,
    overlap: 0,
    failed: 0,
    tooShort: 0
  }

  function findVoie(nomVoie) {
    const ctx = computeStringContext(nomVoie)

    if (ctx.significantWords.length < 2) {
      stats.tooShort++
      return
    }

    // SIGNIFICANT WORDS
    const significantWordsCompareResults = fantoirCommune.filter(fantoirItem => {
      return ctx.significantWordsString === fantoirItem.significantWordsString
    })

    if (significantWordsCompareResults.length > 0) {
      stats.significantWords++
      return selectBestResult(significantWordsCompareResults, ctx)
    }

    // PHONETIC
    const phoneticCompareResults = fantoirCommune.filter(fantoirItem => {
      return ctx.phoneticString === fantoirItem.phoneticString
    })

    if (phoneticCompareResults.length > 0) {
      stats.phonetic++
      return selectBestResult(phoneticCompareResults, ctx)
    }

    // OVERLAPPING
    const overlapCompareResults = fantoirCommune.filter(fantoirItem => {
      return overlap(ctx.significantWords, fantoirItem.significantWords)
    })

    if (overlapCompareResults.length > 0) {
      stats.overlap++
      return selectBestResult(overlapCompareResults, ctx)
    }

    stats.failed++
  }

  return {
    findVoie,

    findCodeVoie(nomVoie) {
      const voie = findVoie(nomVoie)
      if (voie) {
        return voie.codeRivoli
      }
    },

    getVoie(codeVoie) {
      return index[codeVoie]
    },

    getStats() {
      return stats
    }
  }
}

module.exports = {createMatcher}
