var Stream = require('stream') // haxx to fix browserify+readable-stream
var gunzip = require('gunzip-maybe')
var path = require('path')
var multibase = require('multibase')
var browser = require('file-browser-widget')
var reader = require('filereader-stream')
var concat = require('concat-stream')
var decrypt = require('senc').DecryptStream
var tar = require('tar-stream')
var request = require('browser-request')

var directories = {}
var files = {}

function gid(id) {
  return document.getElementById(id)
}

var ipfsPathRE = /^\/ip[fn]s\//
var localGway = "http://localhost:8080"
var globalGway = "https://gateway.ipfs.io"
var chosenGway = globalGway

function chooseGateway(cb) {
  if (ipfsPathRE.test(window.location.path)) {
    return cb(null, "") // use this domain.
  }

  request(localGway + "/version", function(err, resp, body) {
    // failed? use global.
    if (err) return cb(null, globalGway)

    if (/go-ipfs/.test(body)) {
      // it is an ipfs gateway!
      return cb(null, localGway)
    }

    // no idea. use global.
    return cb(null, globalGway)
  })
}

chooseGateway(function(err, gway) {
  if (!err) chosenGway = gway
})

function getFromIPFS(link, cb) {
  if (!ipfsPathRE.test(link)) {
    link = "/ipfs/" + link
  }

  request(chosenGway + link, function(err, resp, body) {
    cb(err, body)
  })
}

function sort(a, b) {
  return (a.type+'/'+a.name).localeCompare(b.type+'/'+b.name)
}

// patch in the decrypt handler.
gid('decrypt').onclick = clickDecrypt

function show(id, on) {
  gid(id).style.display = on ? 'block' : 'none'
}

function clickDecrypt() {
  gid('error').innerText = ""
  gid('ipfs-link').style.border = '1px solid black'
  gid('senc-key').style.border = '1px solid black'

  var link = gid('ipfs-link').value
  if (!link) {
    gid('ipfs-link').style.border = '2px solid red'
    return gid('error').innerText = 'ipfs hash or link required'
  }

  var key = gid('senc-key').value
  if (!key) {
    gid('senc-key').style.border = '2px solid red'
    return gid('error').innerText = 'secret key required'
  }

  show('spinner', true)

  getDecryptAndShow(link, key, function(err) {
    show('spinner', false)

    if (err) {
      gid('error').innerText = "" + err
      show('form', true)
    }
  })
}

function getDecryptAndShow(link, key, cb) {
  var k = multibase.decode(key)

  getFromIPFS(link, function(err, body) {
    if (err) return cb(err)

    reader(body)
      .pipe(decrypt(k))
      .pipe(gunzip())
      .pipe(tar.extract())
      .on('entry', function(entry, stream, next) {
        var name = path.join('/', entry.name)
        var dir = path.dirname(name)

        if (!directories[dir]) directories[dir] = []
        if (name !== '/') directories[dir].push(entry)

        if (entry.type === 'directory' || entry.size > 100*1024) {
          stream.resume()
          next()
          return
        }

        stream.pipe(concat(function(data) {
          files[name] = data.toString()
          next()
        }))
      })
      .on('finish', function() {
        var br = browser()

        br.on('directory', function(cwd) {
          window.location = '#/d'+path.join('/', cwd)
        })

        br.on('file', function(cwd) {
          window.location = '#/f'+path.join('/', cwd)
        })

        br.appendTo('#browser')

        window.onhashchange = function() {
          var hash = location.hash.slice(2)
          var type = hash[0] === 'f' ? 'file' : 'directory'
          var cwd = hash.slice(1) || '/'

          if (cwd !== '/') cwd = cwd.replace(/\/$/, '')

          document.title = cwd

          if (hash[0] === 'f') br.file(cwd, files[cwd] || '(file cannot be displayed)')
          else br.directory(cwd, (directories[cwd] || []).sort(sort))
        }

        window.onhashchange()
        cb(null)
      })
  })
}

