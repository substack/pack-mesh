#!/usr/bin/env node
var minimist = require('minimist')
var argv = minimist(process.argv.slice(2), {
  alias: { u: 'unpack', t: 'type', h: 'help' },
  number: [ 'type' ],
  boolean: ['unpack','help']
})
var fs = require('fs')
var path = require('path')
if (argv.help) {
  fs.createReadStream(path.join(__dirname,'usage.txt')).pipe(process.stdout)
  return
}
var concat = require('concat-stream')
var packer = require('../')

var input = argv._[0] === '-' || argv._.length === 0
  ? process.stdin
  : fs.createReadStream(argv._[0])

if (argv.unpack) {
  input.pipe(concat(function (buf) {
    console.log(JSON.stringify(packer.unpack(buf)))
  }))
} else {
  input.pipe(concat({ encoding: 'string' }, function (body) {
    var buf = Buffer(packer.pack(JSON.parse(body),argv))
    process.stdout.write(buf)
  }))
}
