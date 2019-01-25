const {callbackify} = require('util')
const merge = callbackify(require('.'))

module.exports = function (options, cb) {
  const {departement} = options
  console.log(`Préparation du département ${departement}`)
  merge(options, cb)
}
