var slice = Array.prototype.slice
module.exports = Concert

function Concert() {}

Concert.prototype.on = function(name, fn, context) {
  if (name == null || !fn) return this

  if (!this._events) this._events = {}
  var fns = this._events[name] || (this._events[name] = [])
  fns.push([fn, context])
  return this
}

Concert.prototype.once = function(name, fn, context) {
  if (!fn) return this

  var self = this, called = 0
  function once() {
    if (called++) return
    Concert.prototype.off.call(self, name, fn)
    fn.apply(this, arguments)
  }
  once.fn = fn

  return Concert.prototype.on.call(this, name, once, context)
}

Concert.prototype.off = function(name, fn, context) {
  if (!this._events) return this

  if (!fn && !context)
    return name != null ? delete this._events[name] : delete this._events, this

  var names = name != null ? [name] : Object.keys(this._events)
  for (var i = 0, l = names.length; i < l; ++i) {
    var fns = this._events[names[i]]
    if (fns) this._events[names[i]] = fns.filter(function(pair) {
      if (fn && pair[0] !== fn && pair[0].fn !== fn) return true
      if (context && pair[1] !== context) return true
      return false
    })
  }

  return this
}

Concert.prototype.trigger = function(name) {
  if (!this._events) return this

  var fns
  if (fns = this._events[name]) trigger.call(this, fns, slice.call(arguments,1))
  if (fns = this._events.all) trigger.call(this, fns, arguments)
  return this
}

function trigger(fns, args) {
  for (var i = 0, l = fns.length; i < l; ++i) {
    var event = fns[i]
    event[0].apply(event[1] || this, args)
  }
}

Concert.on = Concert.prototype.on
Concert.once = Concert.prototype.once
Concert.off = Concert.prototype.off
Concert.trigger = Concert.prototype.trigger
