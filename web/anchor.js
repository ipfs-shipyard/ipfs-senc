var x = module.exports = {}

x.urlHashLoad = urlHashLoad
x.urlHashSet = urlHashSet
x.slugMake = slugMake
x.slugSplit = slugSplit

function urlHashLoad() {
  var h = window.location.hash.substr(1)
  if (!h) return
  return slugSplit(h)
}

function urlHashSet(key, path) {
  window.location.hash = slugMake(key, path)
}

function slugMake(key, path) {
  if (key.key && key.path && !path) {
    path = key.path
    key = key.key
  }
  return '#' + key + ':' + path
}

function slugSplit(s) {
  var v = s.split(':')
  return { key: v[0], path: v[1] }
}
