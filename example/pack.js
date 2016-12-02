var pack = require('../pack')
var fs = require('fs')
var mesh = JSON.parse(fs.readFileSync(process.argv[2],'utf8'))
process.stdout.write(Buffer.from(pack(mesh)))
