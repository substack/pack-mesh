var P = 'P'.charCodeAt(0)
var M = 'M'.charCodeAt(0)
var E = 'E'.charCodeAt(0)
var S = 'S'.charCodeAt(0)
var H = 'H'.charCodeAt(0)
var VERSION = 0
var vfmtcodes = require('./vfmtcodes.json')
var vsizes = require('./vsizes.json')

module.exports = function (mesh, opts) {
  if (!opts) opts = {}
  var vlen = mesh.positions.length
  var vdim = mesh.positions[0].length
  var vfmt = opts.type || 'f32'
  var vfmtcode = vfmtcodes[vfmt]
  var vsize = vsizes[vfmt]
  var extents = opts.extents
  if (!extents) {
    extents = []
    for (var j = 0; j < vdim; j++) {
      extents[j] = [Infinity,-Infinity]
      for (var i = 0; i < vlen; i++) {
        var p = mesh.positions[i][j]
        if (p < extents[j][0]) extents[j][0] = p
        if (p > extents[j][1]) extents[j][1] = p
      }
    }
  }
  var clen = mesh.cells.length
  var cdim = mesh.cells[0].length
  var csize = 2
  var buf = new ArrayBuffer(14+8*2*vdim+vlen*vdim*vsize+clen*cdim*csize)
  var dv = new DataView(buf)
  var offset = 0
  dv.setUint8(offset,P); offset+=1
  dv.setUint8(offset,M); offset+=1
  dv.setUint8(offset,E); offset+=1
  dv.setUint8(offset,S); offset+=1
  dv.setUint8(offset,H); offset+=1
  dv.setUint16(offset,VERSION); offset+=2
  dv.setUint16(offset,mesh.positions.length); offset+=2
  dv.setUint8(offset,vdim); offset+=1
  dv.setUint16(offset,mesh.cells.length); offset+=2
  dv.setUint8(offset,cdim); offset+=1
  dv.setUint8(offset,vfmtcode); offset+=1
  for (var j = 0; j < vdim; j++) {
    dv.setFloat64(offset, extents[j][0]); offset += 8
    dv.setFloat64(offset, extents[j][1]); offset += 8
  }
  if (vfmt === 'f32') {
    for (var i = 0; i < vlen; i++) {
      for (var j = 0; j < vdim; j++) {
        dv.setFloat32(offset,mesh.positions[i][j])
        offset+=vsize
      }
    }
  } else if (vfmt === 'f64') {
    for (var i = 0; i < vlen; i++) {
      for (var j = 0; j < vdim; j++) {
        dv.setFloat64(offset,mesh.positions[i][j])
        offset+=vsize
      }
    }
  } else if (vfmt === 's8') {
    var min = -Math.pow(2,7), max = Math.pow(2,7)-1
    for (var i = 0; i < vlen; i++) {
      for (var j = 0; j < vdim; j++) {
        var r = extents[j][1]-extents[j][0]
        var n = (mesh.positions[i][j]-extents[j][0])/r
        dv.setInt8(offset,Math.round(n*(max-min)+min))
        offset+=vsize
      }
    }
  } else if (vfmt === 's16') {
    var min = -Math.pow(2,15), max = Math.pow(2,15)-1
    for (var i = 0; i < vlen; i++) {
      for (var j = 0; j < vdim; j++) {
        var r = extents[j][1]-extents[j][0]
        var n = (mesh.positions[i][j]-extents[j][0])/r
        dv.setInt16(offset,Math.round(n*(max-min)+min))
        offset+=vsize
      }
    }
  }
  for (var i = 0; i < clen; i++) {
    for (var j = 0; j < cdim; j++) {
      dv.setUint16(offset,mesh.cells[i][j])
      offset+=csize
    }
  }
  return buf
}
