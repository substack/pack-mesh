#!/usr/bin/env node
var minimist = require('minimist')
var argv = minimist(process.argv.slice(2), {
  alias: { u: 'unpack', b: 'bits' },
  number: [ 'bits' ],
  boolean: ['unpack']
})
var fs = require('fs')
var concat = require('concat-stream')
var packer = require('../')

var input = argv._[0] === '-' || argv._.length === 0
  ? process.stdin
  : fs.createReadStream(argv._[0])

if (argv.unpack) {
  input.pipe(concat(function (body) {
  }))
} else {
  input.pipe(concat({ encoding: 'string' }, function (body) {
    var buf = Buffer(packer.pack(JSON.parse(body),argv))
    process.stdout.write(buf)
  }))
}
