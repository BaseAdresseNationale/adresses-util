const test = require('ava')
const {rewriteSuffixes, getPositionPriorityByType} = require('.')

test('b,t => bis,ter', t => {
  const adresses = [
    {numero: 1},
    {numero: 1, suffixe: 'b'},
    {numero: 1, suffixe: 't'}
  ]
  rewriteSuffixes(adresses)
  t.deepEqual(adresses, [
    {numero: 1},
    {numero: 1, suffixe: 'bis'},
    {numero: 1, suffixe: 'ter'}
  ])
})

test('a,b => a,b', t => {
  const adresses = [
    {numero: 1},
    {numero: 1, suffixe: 'a'},
    {numero: 1, suffixe: 'b'}
  ]
  rewriteSuffixes(adresses)
  t.deepEqual(adresses, [
    {numero: 1},
    {numero: 1, suffixe: 'a'},
    {numero: 1, suffixe: 'b'}
  ])
})

test('Test types priority', t => {
  t.is(getPositionPriorityByType('entrée'), 10)
  t.is(getPositionPriorityByType('cage d’escalier'), 7)
  t.is(getPositionPriorityByType('segment'), 1)
  t.is(getPositionPriorityByType(), 0)
  t.is(getPositionPriorityByType('entree'), 0)
})
