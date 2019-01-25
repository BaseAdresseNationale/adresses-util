const {callbackify} = require('util')
const merge = require('.')

module.exports = callbackify(merge)
