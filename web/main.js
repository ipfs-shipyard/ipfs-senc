const SencData = require('./data')
const SencUI = require('./ui')
const EventEmitter = require('eventemitter3')
const $ = require('jquery')

// app will have all the variables.
// gets populated as we go.
var app = window.app = {}

class SencApp extends EventEmitter {
  constructor($el) {
    super()

    this.ui = new SencUI($el)
    this.$el = this.ui.$el

    this.onLoad = this.onLoad.bind(this)
    this.ui.on('load', this.onLoad)
  }

  getFileParams() {
    return this.ui.getFileParams()
  }

  setFileParams(key, path) {
    this.ui.setFileParams(key, path)
    if (SencData.isIpfsPath(path)) {
      this.onLoad({key: key, path: path})
    }
  }

  onLoad(kp) {
    var key = kp.key
    var path = kp.path

    if (!SencData.isIpfsPath(path))
      return

    this.ui.setLoading(true)
    path = SencData.normalizePath(path)
    var s = SencData.loadAndDecrypt(path, key)
    this.ui.renderTree(s)
    this.emit('params', this.getFileParams())
  }
}

function main() {
  $senc = $('#senc-container')
  var app = new SencApp($senc)
  app.on('params', (kp) => {
    urlHashSet(kp.key, kp.path)
  })

  $('body').append(app.$el)

  var kp = urlHashLoad()
  app.setFileParams(kp.key, kp.path)
}


function urlHashLoad() {
  var h = window.location.hash.substr(1)
  if (!h) return

  vals = h.split(':')
  return {
    key: vals[0],
    path: vals[1],
  }
}

function urlHashSet(key, path) {
  window.location.hash = key +':'+ path
}

window.onload = main
