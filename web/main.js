const $ = require('jquery')
const EventEmitter = require('eventemitter3')
const SencData = require('./data')
const SencUI = require('./ui')
const anchor = require('./anchor')
// const audit = require('./auditlog')

// app will have all the variables.
// gets populated as we go.
var app = window.app = {}

// set main entry point
window.onload = main

class SencApp extends EventEmitter {
  constructor(opts) {
    super()

    this.opts = opts || {}

    this.ui = new SencUI(opts.$el)
    this.$el = this.ui.$el

    this.onLoadFile = this.onLoadFile.bind(this)
    this.ui.on('load', (kp) => this.emit('loadfile', kp)) // fwd event
    this.on('loadfile', this.onLoadFile)
  }

  dataOpts() { // only send some opts to data
    return {
      gateway: this.opts.gateway,
      forceGateway: this.opts.forceGateway,
      forceWindowIpfs: this.opts.forceWindowIpfs,
    }
  }

  getFileParams() {
    return this.ui.getFileParams()
  }

  setFileParams(key, path) {
    var curr = this.getFileParams()
    if (curr.key == key && curr.path == path)
      return // nothing to change

    this.ui.setFileParams(key, path)

    if (SencData.isIpfsPath(path)) {
      this.emit('loadfile', {key: key, path: path})
    }
  }

  onLoadFile(kp) {
    var key = kp.key
    var path = kp.path

    if (!SencData.isIpfsPath(path))
      return

    this.ui.setLoading(true)
    path = SencData.normalizePath(path)
    var s = SencData.loadAndDecrypt(path, key, this.dataOpts())
    this.ui.renderTree(s)
    this.emit('params', this.getFileParams())
  }
}

// SencApp = audit(SencApp, 'app')
// SencUI = audit(SencUI, 'ui')

function main() {

  var opts = {'$el': $('#senc-container')}
  opts.gateway = queryParam('gateway') || null
  opts.forceGateway = queryParam('forceGateway')
  opts.forceWindowIpfs = queryParam('forceWindowIpfs')

  $senc = $('#senc-container')
  var app = new SencApp(opts)
  app.on('params', (kp) => {
    anchor.urlHashSet(kp.key, kp.path)
  })

  $('body').append(app.$el)

  var kp = anchor.urlHashLoad()
  app.setFileParams(kp.key, kp.path)
}

function queryParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    var d = decodeURIComponent(results[2].replace(/\+/g, " "));
    if (d) {
      var dl = d.toLowerCase()
      if (dl === 'true') return true
      if (dl === 'false') return false
      if (dl === 'undefined') return undefined
    }
    return d
}
