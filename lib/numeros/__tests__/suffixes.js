const test = require('ava')
const {rewriteSuffixes} = require('../suffixes')

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

