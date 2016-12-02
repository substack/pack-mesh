var P = 'P'.charCodeAt(0)
var M = 'M'.charCodeAt(0)
var E = 'E'.charCodeAt(0)
var S = 'S'.charCodeAt(0)
var H = 'H'.charCodeAt(0)
var VERSION = 0

module.exports = function (mesh, opts) {
  if (!opts) opts = {}
  var vlen = mesh.positions.length
  var vdim = mesh.positions[0].length
  var vfmt = opts.type || 'f32'
  var vsize = { f32: 4, f64: 8, s8: 1, s16: 2, s32: 4 }[vfmt]
  var extents = opts.extents
  if (!extents && /^[su]/.test(vfmt)) {
    extents = {}
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
  var buf = new ArrayBuffer(13+vlen*vdim*vsize+clen*cdim*csize)
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
  if (vfmt === 'f32') {
    for (var i = 0; i < vlen; i++) {
      for (var j = 0; j < vdim; j++) {
        dv.setFloat32(offset,mesh.positions[i][j])
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
  for (var i = 0; i < clen.length; i++) {
    for (var j = 0; j < cdim; j++) {
      dv.setUint16(offset,mesh.cells[i][j])
      offset+=csize
    }
  }
  return buf
}
