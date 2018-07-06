const tar2yofs = require('./tar2yofs')
const request = require('request')
const senc = require('senc')
const mb = require('multibase')

var x = module.exports = {}
x.loadAndDecrypt = loadAndDecrypt
x.normalizePath = normalizePath
x.isIpfsPath = isIpfsPath

const globalGateway = 'https://gateway.ipfs.io'
const localGateway = 'http://localhost:8080'
function gateway(userGateway) {
  if (window.origin)
  var g = userGateway || globalGateway
  // if we're hosted on ipfs, use same gateway
  if (isIpfsPath(window.location.pathname)) {
    g = window.origin // just use paths w/ same origin.
  }
  return g
}

function ipfsCat() {
  var ipfs = window.ipfs
  if (!ipfs || !ipfs.files.catReadableStream)
    return null
  console.log('using window.ipfs')
  return path => ipfs.files.catReadableStream(path)
}


function gatewayCat(userGateway) {
  var gway = gateway(userGateway)
  console.log('using gateway:', gway)
  return (path) => request(gway + path)
}

function catFn(opts) {
  var opts = opts || {}
  if (opts.forceGateway) {
    console.log("forcing gateway")
    return gatewayCat(opts.gateway)
  }
  if (opts.forceWindowIpfs) {
    console.log("forcing window.ipfs")
    return ipfsCat(opts)
  }

  // window.ipfs keeps being buggy or broken. disable for now:
  // return ipfsCat(opts) || gatewayCat(opts.gateway)
  return gatewayCat(opts.gateway)
}

// option 2: js-ipfs-api
// var ipfs = ipfsApi('')
// var cat = (path) => ipfs.files.catReadableStream(path)

// option 3: js-ipfs node
// var node = new IPFS()
// node.on('ready', () => {
//   console.log('ipfs node ready')
//   onready()
// })
// var cat = (path) => ipfs.files.catReadableStream(path)

// have to allow multibase.
// we should really have a cid.isValidCid()
var ipfsPathRe = /^(\/ipfs\/)?[A-Za-z0-9\._\-=+/?]{10,}$/
var ipnsPathRe = /^\/ipns\/[\S]+$/
function isIpfsPath(path) {
  path = path.trim()
  return (!!path.match(ipfsPathRe)) || (!!path.match(ipnsPathRe))
}

function normalizePath(path) {
  path = path.trim()
  if (!path.substr(0, 6).match(/^\/ip[fn]s\//))
    path = '/ipfs/' + path
  return path
}

function loadAndDecrypt(path, key, opts) {
  console.log('loading: ' + path)

  var ipfsCat = catFn(opts)
  var s = ipfsCat(path)
  s.on('error', console.error)

  if (key && key.length > 0) {
    var decodedKey = mb.decode(key)
    console.log('decrypting with: ' + key)
    s = s.pipe(senc.DecryptStream(decodedKey))
    s.on('error', console.error)
  }

  return s
}
