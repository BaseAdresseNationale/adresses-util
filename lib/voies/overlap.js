const {last, minBy} = require('lodash')

function isSimilar(word, reference) {
  if (word.charAt(0) !== reference.charAt(0)) {
    return false
  }

  let posInWord = 1
  let posInReference = 1
  while (posInWord < word.length && posInReference < reference.length) {
    if (word.charAt(posInWord) === reference.charAt(posInReference)) {
      posInWord++
    }

    posInReference++
  }

  return posInWord === word.length
}

function wordsDistance(word1, word2) {
  if (!word1 || !word2) {
    return -1
  }

  if (word1 === word2) {
    return 0
  }

  const candidateDistance = Math.abs(word2.length - word1.length)
  const booleanIsSimilar = word1.length < word2.length ? isSimilar(word1, word2) : isSimilar(word2, word1)
  return booleanIsSimilar ? candidateDistance : -1
}

function computeOverlap(w1, w2, state) {
  if (w1.length === 0 || w2.length === 0) {
    return state
  }

  const distance = wordsDistance(w1[0], w2[0])
  if (distance === 0) {
    return computeOverlap(w1.slice(1), w2.slice(1), {...state, exactWordsMatching: state.exactWordsMatching + 1})
  }

  if (distance > 0) {
    return computeOverlap(w1.slice(1), w2.slice(1), {...state})
  }

  const path1State = computeOverlap(
    w1.slice(1),
    w2,
    {...state, lMissing: state.lMissing + 1, totalMissing: state.totalMissing + 1}
  )
  const path2State = computeOverlap(
    w1,
    w2.slice(1),
    {...state, rMissing: state.rMissing + 1, totalMissing: state.totalMissing + 1}
  )
  if (path1State.exactWordsMatching > path2State.exactWordsMatching) {
    return path1State
  }

  if (path1State.exactWordsMatching < path2State.exactWordsMatching) {
    return path2State
  }

  return minBy([path1State, path2State], s => Math.min(s.lMissing, s.rMissing))
}

function overlap(words1, words2) {
  // Si l'une des chaînes n'a qu'un mot signifiant, l'autre ne peut n'en avoir qu'un seul
  if ((words1.length === 1 || words2.length === 1) && words1.length + words2.length > 2) {
    return false
  }

  const firstWordDistance = wordsDistance(words1[0], words2[0])

  if (firstWordDistance === -1) {
    return false
  }

  // S'il y a plus d'un mot, on compare le dernier mot (directeur)
  if (words1.length >= 2 && words2.length >= 2) {
    const lastWord1 = last(words1)
    const lastWord2 = last(words2)
    const lastWordMinLength = Math.min(lastWord1.length, lastWord2.length)
    const tolerance = lastWordMinLength <= 5 ? 0 :
      (lastWordMinLength <= 8 ? 1 : 2)
    const distance = wordsDistance(lastWord1, lastWord2)

    if (distance === -1 || distance > tolerance) {
      return false
    }
  }

  const overlapState = computeOverlap(
    words1.slice(1),
    words2.slice(1),
    {lMissing: 0, rMissing: 0, totalMissing: 0, exactWordsMatching: firstWordDistance === 0 ? 1 : 0}
  )
  const minNumWords = Math.min(words1.length, words2.length)
  const minExactMatching = minNumWords <= 2 ? 1 : 2
  return overlapState.exactWordsMatching >= minExactMatching &&
    overlapState.totalMissing <= Math.abs(words1.length - words2.length)
}

module.exports = {overlap, wordsDistance, isSimilar}
