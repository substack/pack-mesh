# pack-mesh

pack a simplicial-complex mesh into a binary format

# example

## pack

``` js
var pack = require('pack-mesh/pack')
var fs = require('fs')
var mesh = JSON.parse(fs.readFileSync(process.argv[2],'utf8'))
process.stdout.write(Buffer.from(pack(mesh)))
```

## unpack

``` js
var unpack = require('pack-mesh/unpack')
var fs = require('fs')
var buf = fs.readFileSync(process.argv[2])
console.log(JSON.stringify(unpack(buf)))
```

# usage

```
usage: pack-mesh FILE {OPTIONS}

  -t --type    Set a vertex precision: s8 s16 f32 f64
  -u --unpack  Turn binary data into simplicial complex json

If FILE is not provided or is "-", read from stdin.

```

# api

``` js
var pack = require('pack-mesh/pack')
var unpack = require('pack-mesh/unpack')
```

## var u8 = pack(mesh, opts)

Return a Uint8Array `u8` given a simplicial complex `mesh`.

Optionally set:

* `opts.type` - precision per vertex: one of `'f32'`, `'f64'`, `'s8'`, `'s16'`

Simplicial complexes have:

* mesh.positions - array of vertex coordinates
* mesh.cells - array of position indicies describing a triangle, edge, or point

## var mesh = unpack(buf)

Return a simplicial complex `mesh` given an array buffer `buf`.

# install

To get the library:

```
npm install pack-mesh
```

To get the command-line program:

```
npm install -g pack-mesh
```

# license

BSD
