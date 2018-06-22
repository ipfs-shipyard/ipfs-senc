const senc = require('senc')
const mb = require('multibase')
const request = require('request')
const yo = require('yo-yo')
const yofs = require('yo-fs')
const tar2yofs = require('./tar2yofs')
const concat = require('concat-stream')
const through2 = require('through2')
const pretty = require('prettier-bytes')

const $ = document.querySelector.bind(document)

// app will have all the variables.
// gets populated as we go.
var app = window.app = {}

// 1: gateway
app.ipfsGateway = 'https://gateway.ipfs.io'
// if we're hosted on ipfs, use same gateway
if (isIpfsPath(window.location.pathname)) {
  app.ipfsGateway = window.origin // just use paths w/ same origin.
}

var cat = (path) => request(app.ipfsGateway + path)

// 2: js-ipfs-api
// var ipfs = ipfsApi('')
// var cat = (path) => ipfs.files.catReadableStream(path)

// 3: js-ipfs node
// var node = new IPFS()
// node.on('ready', () => {
//   console.log('ipfs node ready')
//   onready()
// })
// var cat = (path) => ipfs.files.catReadableStream(path)

function main() {
  app.$submit = $('#input-submit')
  app.$submit = $('#input-submit')
  app.$path = $('#input-path')
  app.$key = $('#input-key')
  app.$browser = $('#browser')
  app.$counter = $('#counter')
  app.$loading = $('#loading-spinner')

  app.$submit.onclick = onClickLoad
  app.$submit.disabled = false

  // if path is seeded, process it.
  populateFromHash()
  if (app.$path.value != '') onClickLoad()
  else setLoading(false) // else stop loading.
}

function isIpfsPath(path) {
  path = path.trim()
  return !!path.substr(0, 6).match(/^\/ip[fn]s\//)
}

function cleanPath(path) {
  path = path.trim()
  if (!isIpfsPath(path))
    path = '/ipfs/' + path
  return path
}

function onClickLoad() {
  setLoading(true)
  var path = cleanPath(app.$path.value)
  var key = app.$key.value

  var s = loadAndDecrypt(path, key)
  renderTree(s, app.$browser)
  populateToHash(path, key)
}

function loadAndDecrypt(path, key) {
  console.log('loading: ' + path)
  var s = cat(path)
  s.on('error', console.error)
  if (key && key.length > 0) {
    var decodedKey = mb.decode(key)
    console.log('decrypting with: ' + key)
    s = s.pipe(senc.DecryptStream(decodedKey))
  }
  s.on('error', console.error)
  return s
}

function renderTree(bundle, el) {
  var onclick = () => {}
  var yf = yofs('/', [], onclick)
  clearElem(el)
  el.appendChild(yf.widget)

  var c = tar2yofs((err, files) => {
    if (err) throw err
    var entries = Object.values(files)
    yf.update(yf.render('/', entries, onclick))
    setLoading(false)
  })

  bundle.pipe(counterStream()).pipe(c)
  // bundle.pipe(counterStream()) .on('data', (d) => { console.log(d.length) })
}

function setLoading(toggle) {
  if (toggle)
    app.$loading.className = 'loading-spinner'
  else
    app.$loading.className = ''
}

function populateFromHash() {
  var h = window.location.hash.substr(1)
  if (!h) return

  vals = h.split(':')
  app.$key.value = vals[0]
  app.$path.value = vals[1]
}

function populateToHash(path, key) {
  window.location.hash = key +':'+ path
}

function clearElem(el) {
  while (el.hasChildNodes()) {
    el.removeChild(el.lastChild)
  }
}

function counterStream() {
  var size = 0
  return through2(function (chunk, enc, cb) {
    size += chunk.length
    app.$counter.innerText = pretty(size)
    this.push(chunk)
    cb()
  })
}

window.onload = main
