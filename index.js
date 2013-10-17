var slice = Array.prototype.slice

exports.on = function(name, fn, context) {
  if (name == null || !fn) return this

  if (!this._events) this._events = {}
  var fns = this._events[name] || (this._events[name] = [])
  fns.push([fn, context])
  return this
}

exports.once = function(name, fn, context) {
  if (!fn) return this

  var self = this, called = 0
  function once() {if (!called++) self.off(name, fn), fn.apply(this, arguments)}
  once.fn = fn
  return this.on(name, once, context)
}

exports.off = function(name, fn, context) {
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

exports.trigger = function(name) {
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
