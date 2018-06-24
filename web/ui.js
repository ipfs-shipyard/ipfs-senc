const $ = require('jquery')
const yo = require('yo-yo')
const yofs = require('yo-fs')
const filedl = require('js-file-download')
const pretty = require('prettier-bytes')
const through2 = require('through2')
const EventEmitter = require('eventemitter3')
const tar2yofs = require('./tar2yofs')
const concat = require('concat-stream')
const fromBuffer = require('./from-buffer')

class SencUI extends EventEmitter {

  constructor($el) {
    super()

    this.$el = $el

    // rootEl is already populated with the right html.
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
    this.onDownloadAll = this.onDownloadAll.bind(this)
    this.onDownloadFile = this.onDownloadFile.bind(this)

    listenForMouseMoving(this.$el)
    registerFormButtonHandlers(this.$el, this.onClickLoad, this.onDownloadAll)
    registerFileButtonHandlers(this.$el, this.onSetFileMode, this.onDownloadFile)
  }

  setLoading(toggle) {
    if (!this._$loading) this._$loading = this.$el.find('#loading-spinner')
    if (!this._$dlAllBtn) this._$dlAllBtn = this.$el.find('form button#input-download')

    this._$loading.toggleClass('loading-spinner', toggle)
    if (toggle) {
      this._$dlAllBtn.attr('disabled', true)
    } else {
      this._$dlAllBtn.removeAttr('disabled')
    }
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

  onDownloadFile(e) {
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

  onDownloadAll(e) {
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

    // start the pipeline
    stream
      .pipe(counterStream(this.$counter))
      .pipe(concat((tarball) => {
        // keep the whole buffer around, to download it quickly.
        // todo: change this when we remove whole file buffering
        // this is definitely clunky (stream->concat->stream)

        // set it on this.yf so it goes away at exactly the same time.
        // this is here mostly to support downloading the whole archive
        // but this buffer is also the source for everything.
        this.yf.rawArchive = tarball

        var s = fromBuffer.createReadStream(this.yf.rawArchive)

        // ok, and now feed it into the tarball reader
        s.pipe(tar2yofs((err, files) => {
          if (err) throw err

          // ok we're ready to render everything
          var entries = Object.values(files)
          this.yf.update(this.yf.render('/', entries, this.onSelectFile))
          this.setLoading(false)
          this.autoSelectFirstFile()
        })) // <-- this is what renders the file browser
      }))
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

function registerFormButtonHandlers($el, onClickLoad, onDownloadAll) {
  var $submit = $el.find('#form button#input-load')
  var $download = $el.find('#form button#input-download')

  $submit.click(onClickLoad)
  $submit.attr('disabled', false)

  $download.click(onDownloadAll)
  $download.attr('disabled', true) // disabled until it loads.
}

function registerFileButtonHandlers($el, onSetFileMode, onDownloadFile) {
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

  $dlB.click(onDownloadFile)
}

module.exports = SencUI
