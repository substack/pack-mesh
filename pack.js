var alloc = require('buffer-alloc')
var from = require('buffer-from')
var VERSION = 0

module.exports = function (mesh, opts) {
  if (!opts) opts = {}
  var buffers = []
  var vdim = mesh.positions[0].length
  var vlen = mesh.positions.length
  var vbits = opts.bits || 32
  var pbits = Math.pow(2,vbits)-1
  var extents = opts.extents
  if (!extents) {
    extents = []
    for (var j = 0; j < vdim; j++) {
      extents[j] = [Infinity,-Infinity] // min,max
      for (var i = 0; i < vlen; i++) {
        var p = mesh.positions[i][j]
        if (p < extents[j][0]) extents[j][0] = p
        if (p > extents[j][1]) extents[j][1] = p
      }
    }
  }
  var cdim = mesh.cells[0].length
  var clen = mesh.cells.length
  var header = alloc(18)
  header.write('PMESH',0)
  header.writeUInt16BE(VERSION,5)
  header.writeUInt8(vdim,7)
  header.writeUInt32BE(vlen,8)
  header.writeUInt8(vbits,12)
  for (var i = 0; i < vdim.length; i++) {
    header.writeDouble(extents[i][0],12+i*8) // min
    header.writeDouble(extents[i][0],12+i*8) // max
  }
  header.writeUInt8(cdim,13)
  header.writeUInt32BE(clen,14)
  buffers.push(header)
  var bits = []
  var vsize = Math.ceil(vdim*vbits/8)*8
  var vbuf = alloc(vlen*vsize), vix = 0
  for (var i = 0; i < mesh.positions.length; i++) {
    var p = mesh.positions[i]
    if (p.length !== vdim) throw new Error('mixed vertex dimension')
    for (var j = 0; j < vdim; j++) {
      var n = Math.round((p[j]-extents[j][0])/(extents[j][1]-extents[j][0]) * pbits)
      bits[j] = n.toString(2)
    }
    var strbits = bits.join('')
    for (var j = 0; j < strbits.length; j+=8) {
      vbuf[vix++] = parseInt(strbits.slice(j,j+8),2)
    }
  }
  buffers.push(vbuf)
  var csize = clen >= 65536 ? 4 : 2
  var cbuf = alloc((clen+1)*cdim*csize), cix = 0
  for (var i = 0; i < clen; i++) {
    var c = mesh.cells[i]
    if (c.length !== cdim) throw new Error('mixed cell dimension')
    for (var j = 0; j < cdim; j++) {
      if (csize === 2) {
        cbuf.writeUInt16BE(c[j],cix+=csize)
      } else if (csize === 4) {
        cbuf.writeUInt32BE(c[j],cix+=csize)
      }
    }
  }
  buffers.push(cbuf)
  return Buffer.concat(buffers)
}
