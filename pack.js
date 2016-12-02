var P = 'P'.charCodeAt(0)
var M = 'M'.charCodeAt(0)
var E = 'E'.charCodeAt(0)
var S = 'S'.charCodeAt(0)
var H = 'H'.charCodeAt(0)
var VERSION = 0

module.exports = function (mesh, opts) {
  if (!opts) opts = {}
  var vdim = mesh.positions[0].length
  var varray = new Float32Array(mesh.positions.length*vdim)
  for (var i = 0; i < mesh.positions.length; i++) {
    for (var j = 0; j < vdim; j++) {
      varray[i*vdim+j] = mesh.positions[i][j]
    }
  }
  var cdim = mesh.cells[0].length
  var carray = new Uint16Array(mesh.cells.length*cdim)
  for (var i = 0; i < mesh.cells.length; i++) {
    for (var j = 0; j < cdim; j++) {
      carray[i*cdim+j] = mesh.cells[i][j]
    }
  }
  var buf = new ArrayBuffer(13+varray.length*4+carray.length*2)
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
  for (var i = 0; i < varray.length; i++) {
    dv.setFloat32(offset,varray[i]); offset+=4
  }
  for (var i = 0; i < carray.length; i++) {
    dv.setUint16(offset,carray[i]); offset+=2
  }
  return buf
}
