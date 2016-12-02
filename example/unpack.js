var unpack = require('../unpack')
var fs = require('fs')
var buf = fs.readFileSync(process.argv[2])
console.log(JSON.stringify(unpack(buf)))
