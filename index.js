var slice = Array.prototype.slice
module.exports = Concert

function Concert() {}

Concert.prototype.on = function on(name, fn, context) {
  if (name == null) return this
  if (unpack(on, this, name, fn, context)) return this
  if (!fn) return this

  if (!this._events) this._events = {}
  var fns = this._events[name] || (this._events[name] = [])
  fns.push([fn, context])
  return this
}

Concert.prototype.once = function once(name, fn, context) {
  if (name == null) return this
  if (unpack(once, this, name, fn, context)) return this
  if (!fn) return this

  var self = this, called = 0
  function fnOnce() {
    if (called++) return
    Concert.prototype.off.call(self, name, fn)
    fn.apply(this, arguments)
  }
  fnOnce.fn = fn

  return Concert.prototype.on.call(this, name, fnOnce, context)
}

Concert.prototype.off = function off(name, fn, context) {
  if (!this._events) return this
  if (unpack(off, this, name, fn, context)) return this

  if (!fn && !context)
    return name != null ? delete this._events[name] : delete this._events, this

  var names = name != null ? [name] : Object.keys(this._events)
  for (var i = 0, l = names.length; i < l; ++i) {
    var fns = this._events[names[i]]
    if (fns) this._events[names[i]] = fns.filter(function(fnAndContext) {
      if (fn && fnAndContext[0] !== fn && fnAndContext[0].fn !== fn) return true
      if (context && fnAndContext[1] !== context) return true
      return false
    })
  }

  return this
}

function unpack(on, self, obj, fn, context) {
  if (!obj || typeof obj != "object") return
  for (var name in obj) on.call(self, name, obj[name], fn)
  return true
}

Concert.prototype.trigger = function trigger(name) {
  if (!this._events) return this

  var fns
  if (fns = this._events[name]) apply(fns, this, slice.call(arguments, 1))
  if (fns = this._events.all) apply(fns, this, arguments)
  return this
}

function apply(fns, self, args) {
  for (var i = 0, l = fns.length; i < l; ++i) {
    var event = fns[i]
    event[0].apply(event[1] || self, args)
  }
}

Concert.on = Concert.prototype.on
Concert.once = Concert.prototype.once
Concert.off = Concert.prototype.off
Concert.trigger = Concert.prototype.trigger
