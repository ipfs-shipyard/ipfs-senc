const concat = require('concat-stream')
const gunzip = require('gunzip-maybe')
const tar = require('tar-stream')
const fromBuffer = require('./from-buffer')

module.exports = extract

function extract(cb) {
  var files = {}
  var e = tar.extract()
  e.on('entry', (header, stream, next) => {
    files[header.name] = file(header, stream, () => next())
  })
  e.on('error', (err) => cb(err, files))
  e.on('finish', () => {
    cb(null, files)
  })

  var g = gunzip()
  g.pipe(e)
  g.on('error', console.log)
  return g
}

function file(hdr, contents, cb) {
  var f = hdr
  f.modified = f.mtime
  f.createReadStream = (opts) => fromBuffer.createReadStream(f.contents, opts)

  // buffer the data in this file object. expensive!
  contents.pipe(concat(data => {
    f.contents = data
    cb(f)
  }))
  return f
}
