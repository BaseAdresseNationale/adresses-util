const test = require('ava')
const {intersectDistance} = require('./geo-intersect')

function makePoint(lon, lat) {
  return {type: 'Point', coordinates: [lon, lat]}
}

test('basic usage: match', t => {
  const v1 = [
    {numero: '1', position: makePoint(6.120406687259674, 49.1421551145032)},
    {numero: '2', position: makePoint(6.12125962972641, 49.14243234994752)},
    {numero: '8', suffixe: 'B', position: makePoint(6.121900677680969, 49.143028927289606)}
  ]
  const v2 = [
    {numero: '1', position: makePoint(6.120452284812926, 49.14212528528069)},
    {numero: '5', position: makePoint(6.120817065238953, 49.14236216390571)},
    {numero: '8', suffixe: 'bis', position: makePoint(6.121876537799835, 49.142978043031775)}
  ]
  t.true(intersectDistance(v1, v2) >= 0)
})

test('basic usage: mismatch', t => {
  const v1 = [
    {numero: '1', position: makePoint(6.120406687259674, 49.1421551145032)},
    {numero: '2', position: makePoint(6.12125962972641, 49.14243234994752)},
    {numero: '8', suffixe: 'B', position: makePoint(6.121900677680969, 49.143028927289606)}
  ]
  const v2 = [
    {numero: '1', position: makePoint(6.120452284812926, 49.14212528528069)},
    {numero: '5', position: makePoint(6.120817065238953, 49.14236216390571)},
    {numero: '8', suffixe: 'bis', position: makePoint(6.1226919293403625, 49.1431640335138)} // Mismatch
  ]
  t.false(intersectDistance(v1, v2) === -1)
})
