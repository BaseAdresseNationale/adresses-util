const distance = require('@turf/distance').default
const {keyBy, intersection} = require('lodash')

function normalizeSuffixe(suffixe = '') {
  if (suffixe.match(/^[a-z]+/i)) {
    return suffixe.substr(0, 1).toUpperCase()
  }
  return suffixe.toUpperCase()
}

function computeNormalizeNC(numero, suffixe) {
  return `${numero}${normalizeSuffixe(suffixe)}`
}

function computeAverageIntersectDistance(v1, v2, options = {}) {
  const maxAllowedDistance = options.maxAllowedDistance || 0.1
  const indexV1 = keyBy(v1, adresse => computeNormalizeNC(adresse.numero, adresse.suffixe))
  const indexV2 = keyBy(v2, adresse => computeNormalizeNC(adresse.numero, adresse.suffixe))
  const indexIntersection = intersection(Object.keys(indexV1), Object.keys(indexV2))
  if (indexIntersection.length < 2) {
    return -1
  }
  let maxDistance = 0
  let sum = 0
  let compared = 0
  let i = 0
  while (maxDistance <= maxAllowedDistance && i < indexIntersection.length) {
    const nc = indexIntersection[i]
    if (indexV1[nc].position && indexV2[nc].position) {
      const computedDistance = distance(indexV1[nc].position, indexV2[nc].position)
      compared++
      sum += computedDistance
      maxDistance = Math.max(maxDistance, computedDistance)
    }
    i++
  }
  return maxDistance <= maxAllowedDistance && compared >= 2 ? (sum / compared) : -1
}

module.exports = {computeAverageIntersectDistance}
