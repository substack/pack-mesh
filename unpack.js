var vfmtcodes = require('./vfmtcodes.json')
var vsizes = require('./vsizes.json')

module.exports = function (buf) {
  var abuf = new ArrayBuffer(buf.length)
  var dv = new DataView(abuf)
  for (var i = 0; i < buf.length; i++) {
    dv.setUint8(i,buf[i])
  }
  var magic = []
  var offset = 0
  for (; offset < 5; offset++) {
    magic.push(String.fromCharCode(dv.getUint8(offset)))
  }
  if (magic.join('') !== 'PMESH') throw new Error('magic number not present')
  var version = dv.getUint16(offset); offset += 2
  if (version !== 0) throw new Error('incompatible version: ' + version)
  var vlen = dv.getUint16(offset); offset += 2
  var vdim = dv.getUint8(offset); offset += 1
  var clen = dv.getUint16(offset); offset += 2
  var cdim = dv.getUint8(offset); offset += 1
  var csize = 2
  var vfmt = vfmtcodes[dv.getUint8(offset)]; offset += 1
  var vsize = vsizes[vfmt]
  var extents = []
  for (var j = 0; j < vdim; j++) {
    extents[j] = []
    extents[j][0] = dv.getFloat64(offset); offset += 8
    extents[j][1] = dv.getFloat64(offset); offset += 8
  }
  var mesh = { positions: [], cells: [] }
  if (vfmt === 'f32') {
    for (var i = 0; i < vlen; i++) {
      mesh.positions[i] = []
      for (var j = 0; j < vdim; j++) {
        mesh.positions[i][j] = dv.getFloat32(offset)
        offset += vsize
      }
    }
  } else if (vfmt === 'f64') {
    for (var i = 0; i < vlen; i++) {
      mesh.positions[i] = []
      for (var j = 0; j < vdim; j++) {
        mesh.positions[i][j] = dv.getFloat64(offset)
        offset += vsize
      }
    }
  } else if (vfmt === 's16') {
    var min = -Math.pow(2,15), max = Math.pow(2,15)-1
    for (var i = 0; i < vlen; i++) {
      mesh.positions[i] = []
      for (var j = 0; j < vdim; j++) {
        var n = dv.getInt16(offset)
        var r = extents[j][1]-extents[j][0]
        mesh.positions[i][j] = (n-min)/(max-min)*r+extents[j][0]
        offset += vsize
      }
    }
  }
  for (var i = 0; i < clen; i++) {
    mesh.cells[i] = []
    for (var j = 0; j < cdim; j++) {
      mesh.cells[i][j] = dv.getUint16(offset)
      offset += csize
    }
  }
  return mesh
}
