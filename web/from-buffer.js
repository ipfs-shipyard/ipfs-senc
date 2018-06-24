const from = require('from2')

module.exports = fromBuffer

function fromBuffer(buffer) {
  var idx = 0
  return from(function read (size, next) {
    if (idx >= buffer.length) return this.push(null)

    var start = idx
    idx += size
    next(null, buffer.slice(start, idx))
  })
}

function createReadStream(buf, opts) {
  opts = opts || {}
  var start = opts.start || 0
  var end = opts.end || buf.length
  buf = buf.slice(start, end)
  return fromBuffer(buf)
}

fromBuffer.createReadStream = createReadStream
