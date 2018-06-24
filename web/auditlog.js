module.exports = audit

function audit(v, name) {
  console.log('auditing', name)
  var r = v
  switch (typeof(v)) {
  case 'function': r = wrapf(v, name)
  case 'object':
    if (v.prototype) r = auditCls(v, name)
    else r = auditObj(v, name)
  default: // cannot audit
  }
  return r
}

function auditCls(cls, name) {
  // patch prototype
  cls.prototype = auditObj(cls.prototype, name)
  cls = auditObj(cls, '@'+name)
  return cls
}

function auditObj(obj, name) {
  console.log('auditing obj', name)
  funcs(obj).map((f) => {
    obj[f] = objf(obj, f, name)
  })
  return obj
}

function objf(obj, f, name) {
  name = (name+'.' || '') + f
  return wrapf(obj[f], name)
}

function wrapf(fn, name) {
  return function() {
    console.log('->', name)
    var res = fn.apply(this, arguments)
    console.log('<-', name)
    return res
  }
}

function funcs(obj) {
  return Object.getOwnPropertyNames(obj).filter((p) => typeof(obj[p]) === 'function')
}
