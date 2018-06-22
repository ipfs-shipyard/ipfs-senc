const concat = require('concat-stream')
const gunzip = require('gunzip-maybe')
const tar = require('tar-stream')
const from = require('from2')

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
  f.createReadStream = (opts) => createReadStream(f.contents, opts)

  // buffer the data in this file object. expensive!
  contents.pipe(concat(data => {
    f.contents = data
    cb(f)
  }))
  return f
}

function createReadStream(buf, opts) {
  opts = opts || {}
  var start = opts.start || 0
  var end = opts.end || buf.length
  buf = buf.slice(start, end)
  return fromBuffer(buf)
}

function fromBuffer(buffer) {
  var idx = 0
  return from(function read (size, next) {
    if (idx >= buffer.length) return this.push(null)

    var start = idx
    idx += size
    next(null, buffer.slice(start, idx))
  })
}
