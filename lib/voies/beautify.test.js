const test = require('ava')
const beautify = require('./beautify')

test('beautify', t => {
  t.is(beautify('ALLEE DU XV DE FRANCE'), 'Allee du XV de France')
  t.is(beautify('rue de l\'église'), 'Rue de l’Église')
  t.is(beautify('Porte d\'aujourd\'hui'), 'Porte d’Aujourd’hui')
  t.is(beautify('Route de Château-Queyras'), 'Route de Château-Queyras')
  t.is(beautify('double--tiret'), 'Double--Tiret')
  t.is(beautify('Rue Saint - Martin'), 'Rue Saint - Martin')
  t.is(beautify('Rue de Grand -charmont'), 'Rue de Grand -Charmont')
})
