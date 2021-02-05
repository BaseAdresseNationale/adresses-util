const test = require('ava')
const {overlap, isSimilar} = require('./overlap')

function words(str) {
  return str.split(' ')
}

test('isAbridgedOf: basic', t => {
  t.is(isSimilar('h', 'henri'), true)
  t.is(isSimilar('cmdt', 'commandant'), true)
  t.is(isSimilar('tarte', 'tarta'), false)
  t.is(isSimilar('porte', 'fenêtre'), false)
})

test('Libellé abrégé simple', t => {
  t.is(overlap(words('allee henri martin'), words('allee h martin')), true)
})

test('Libellé abrégé simple - 2', t => {
  t.is(overlap(words('rue du marechal joffre'), words('rue joffre')), true)
})

test('Libellé différent', t => {
  t.is(overlap(words('allee francois mitterand'), words('all des fraises')), false)
})

test('Libellé Théo', t => {
  t.is(overlap(words('chemin du voisinet'), words('che voisinet')), true)
})

test('Route de Gyr / Route de Gyronde', t => {
  t.is(overlap(words('route de gyr'), words('route de gyronde')), false)
})

test('Chemin du Bouisset / Chemin du Buisset', t => {
  t.is(overlap(words('chemin du bouisset'), words('chemin du buisset')), true)
})
