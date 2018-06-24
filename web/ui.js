const $ = require('jquery')
const yo = require('yo-yo')
const yofs = require('yo-fs')
const filedl = require('js-file-download')
const pretty = require('prettier-bytes')
const through2 = require('through2')
const EventEmitter = require('eventemitter3')
const tar2yofs = require('./tar2yofs')

var template = `
<div id="senc-container">

  <div id="form">
    <span>Key: <input id="input-key" type="text" placeholder="senc decryption key" /></span>
    <span>Path: <input id="input-path" type="text" placeholder="/ipfs/path..." /></span>
    <button id="input-submit" disabled="disabled">Load -></button>
    <span id="counter">0 B</span>
    <span id="links"><a href="https://github.com/jbenet/ipfs-senc">ipfs-senc</a></span>
  </div>

  <div id="browser">
    <div id="fc-buttons">
      <button id="fc-render" class="sbtn"><i class="icon ion-md-images"></i> Render</button>
      <button id="fc-source" class="sbtn"><i class="icon ion-md-code"></i> Source</button>
      <button id="fc-download" class="sbtn"><i class="icon ion-md-download"></i> Download</button>
    </div>
  </div>

  <div id="loading-spinner" class="loading-spinner">
  </div>

  <img id="ipfs-logo" src="static/ipfs-logo.png" />
</div>
`

class SencUI extends EventEmitter {

  constructor($el) {
    super()

    if (!$el) $el = $(template)
    this.$el = $el

    // rootEl is already populated with the right html.
    this.$submit = $el.find('#input-submit')
    this.$path = $el.find('#input-path')
    this.$key = $el.find('#input-key')
    this.$browser = $el.find('#browser')
    this.$counter = $el.find('#counter')
    this.$loading = $el.find('#loading-spinner')

    this.setupHandlers()
  }

  getFileParams() {
    return {
      key: this.$key.val(),
      path: this.$path.val(),
    }
  }

  setFileParams(key, path) {
    this.$key.val(key)
    this.$path.val(path)
  }

  setupHandlers() {
    this.onClickLoad = this.onClickLoad.bind(this)
    this.onSelectFile = this.onSelectFile.bind(this)
    this.onSetFileMode = this.onSetFileMode.bind(this)
    this.onDownload = this.onDownload.bind(this)

    this.$submit.click(this.onClickLoad)
    this.$submit.attr('disabled', false)

    listenForMouseMoving(this.$el)
    registerFileButtonHandlers(this.$el, this.onSetFileMode, this.onDownload)
  }

  setLoading(toggle) {
    this.$loading.toggleClass('loading-spinner', toggle)
  }

  userSelectEl($el, keepLast) {
    if ($el) {
      if (!keepLast) {
         // clear all prior selections
        this.$browser.find('[userselected]').removeAttr('userselected')
      }
      $el.attr('userselected', 'true')
      return $el
    } else {
      return this.$browser.find('[userselected]')
    }
  }

  onSelectFile(e, entry) {
    this.userSelectEl($(e.target).closest('tr'))
  }

  onSetFileMode(e, mode) {
    if (this.yf) {
      this.yf.srcMode = (mode == 'src')
      this.userSelectEl().click()
    }
  }

  onDownload(e) {
    if (!this.yf) {
      console.error('clicked download before loading files')
      return
    }

    var f = this.yf.selected
    if (!f || !f.contents) {
      console.error('clicked download with no file selected')
      return false
    }

    var basename = f.name.split('/').pop()
    filedl(f.contents, basename)
  }

  onClickLoad() {
    this.emit('load', this.getFileParams())
  }

  renderTree(stream) {
    if (this.yf) {
      $(this.yf.widget).remove()
      this.yf = null
    }
    this.yf = yofs('/', [], this.onSelectFile)
    this.$browser.append(this.yf.widget)

    var c = tar2yofs((err, files) => {
      if (err) throw err
      var entries = Object.values(files)
      this.yf.update(this.yf.render('/', entries, this.onSelectFile))
      this.setLoading(false)
      this.autoSelectFirstFile()
    })

    stream.pipe(counterStream(this.$counter)).pipe(c)
    // stream.pipe(counterStream()) .on('data', (d) => { console.log(d.length) })
  }

  autoSelectFirstFile() {
    $(this.yf.widget).find('.entry.file:first').click()
  }
}

function counterStream($counter) {
  var size = 0
  return through2(function (chunk, enc, cb) {
    size += chunk.length
    $counter.text(pretty(size))
    this.push(chunk)
    cb()
  })
}

function listenForMouseMoving($el) {
  var moving = false
  var timeout = null

  function started() {
    $el.addClass('mouse-moving')
  }

  function moved() {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(ended, 500)
  }

  function ended() {
    $el.removeClass('mouse-moving')
    moving = false
    timeout = null
  }

  $el.mousemove((e) => {
    if (!moving) {
      moving = true
      started()
    }
    moved()
  })
}

function registerFileButtonHandlers($el, onSetFileMode, onDownload) {
  var $rdrB = $el.find('button#fc-render')
  var $srcB = $el.find('button#fc-source')
  var $dlB = $el.find('button#fc-download')
  var selectedCls = 'selected'

  $rdrB.addClass(selectedCls) // start off selected
  $rdrB.click((e) => {
    $rdrB.addClass(selectedCls)
    $srcB.removeClass(selectedCls)
    onSetFileMode(e, 'render')
  })

  $srcB.click((e) => {
    $srcB.addClass(selectedCls)
    $rdrB.removeClass(selectedCls)
    onSetFileMode(e, 'src')
  })

  $dlB.click(onDownload)
}

module.exports = SencUI
