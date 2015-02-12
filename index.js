var slice = Array.prototype.slice
var has = Object.prototype.hasOwnProperty
module.exports = Concert

/**
 * Concert is the main object or *module* that you can inject into your own
 * objects to make them observables (also known as *event emitters* or
 * *dispatchers*). You can then listen to and trigger events on that object.
 *
 * ```javascript
 * var Concert = require("concert")
 * function Galaxy() {}
 * for (var name in Concert) Galaxy.prototype[name] = Concert[name]
 *
 * var galaxy = new Galaxy()
 * galaxy.on("secret", console.log)
 * galaxy.trigger("secret", 42)
 * ```
 *
 * You can also create a new instance of `Concert` to get a blank object to
 * use as an *event bus*.
 * ```javascript
 * var Concert = require("concert")
 * var bus = new Concert
 * bus.on("message", console.log)
 * bus.trigger("message", "One giant man to step, one small...")
 * ```
 *
 * If you need, you can also rename any `Concert`'s function by just assigning
 * them to new names on your object:
 * ```javascript
 * obj.addEventListener = Concert.on
 * obj.emit = Concert.trigger
 * obj.removeEventListener = Concert.off
 * ```
 *
 * @class Concert
 * @constructor
 */
function Concert() {}

/**
 * Add a `listener` for `event`.  
 * Optionally specify the listener's `context` (value of `this`). Defaults to
 * the object listened on.  
 * Returns `this`.
 *
 * You can also specify **multiple events** at once by passing an object whose
 * keys are event names and values functions.  Pass the optional `context`
 * then as the 2nd parameter.
 *
 * Listen to the special `all` event to be called when any event is triggered:
 * `obj.on("all", function(event) {})`
 *
 * The listener will be called with any arguments passed to
 * [`trigger`](#Concert.trigger).
 *
 * @example
 * music.on("cowbell", function() { console.log("Cluck!") })
 * collection.on({add: view.onAdd, remove: view.onRemove}, view)
 *
 * @static
 * @method on
 * @param event
 * @param listener
 * @param context
 */
Concert.prototype.on = function on(name, fn, context) {
  if (name == null) return this
  if (unpack(on, this, name, fn, context)) return this
  if (!fn) return this

  var events = this._events || Object.defineProperty(this, "_events", {
    value: {}, configurable: true, writable: true
  })._events

  var fns = has.call(events, name)? events[name] : (events[name] = [])
  fns.push([fn, context])
  return this
}

/**
 * Like [`on`](#Concert.on), but the listener is guaranteed to be called only
 * once.  
 * Returns `this`.
 *
 * @static
 * @method once
 * @param event
 * @param listener
 * @param context
 */
Concert.prototype.once = function once(name, fn, context) {
  if (name == null) return this
  if (unpack(once, this, name, fn, context)) return this
  if (!fn) return this

  var self = this, called = 0
  function fnOnce() {
    if (called++) return
    Concert.prototype.off.call(self, name, fn)
    return fn.apply(this, arguments)
  }
  fnOnce.fn = fn

  return Concert.prototype.on.call(this, name, fnOnce, context)
}

/**
 * Remove previously added listeners by event name, by function, by context or
 * by any combination.  
 * Returns `this`.
 *
 * You can also specify **multiple events** at once by passing an object whose
 * keys are event names and values functions.  Pass `context` then as the 2nd
 * parameter.
 *
 * @example
 * // Remove all listeners:
 * obj.off()
 * // Remove listeners listening to event "foo":
 * obj.off("foo")
 * // Remove listeners fn of event "foo":
 * obj.off("foo", fn)
 * // Remove listener fn bound to context listening to event "foo":
 * obj.off("foo", fn, context)
 * // Remove all listeners bound to context:
 * obj.off(null, null, context)
 * // Remove all listeners fn listening to any event:
 * obj.off(null, fn)
 * // Remove multiple listeners together:
 * obj.off({add: view.onAdd, remove: view.onRemove}, context)
 *
 * @static
 * @method off
 * @param event
 * @param listener
 * @param context
 */
Concert.prototype.off = function off(name, fn, context) {
  if (!this._events) return this
  if (unpack(off, this, name, fn, context)) return this

  if (!fn && !context) {
    if (name == null) this._events = null
    else delete this._events[name]
    return this
  }

  var names = name != null ? [name] : Object.keys(this._events)
  for (var i = 0, l = names.length; i < l; ++i) {
    var fns = this._events[names[i]]

    /* jshint loopfunc:true */
    if (fns) this._events[names[i]] = fns.filter(function(fnAndContext) {
      if (fn && fnAndContext[0] !== fn && fnAndContext[0].fn !== fn) return true
      if (context && fnAndContext[1] !== context) return true
      return false
    })
  }

  return this
}

/**
 * Trigger `event` and optionally pass any extra arguments to the listeners.  
 * Returns `this`.
 *
 * Every event triggering also automatically triggers an `all` event with the
 * event name prepended to other arguments.
 *
 * @example
 * obj.trigger("change", 42, {previous: 69})
 *
 * @static
 * @method trigger
 * @param event
 * @param [arguments...]
 */
Concert.prototype.trigger = function trigger(name) {
  if (!this._events) return this

  var events = this._events
  if (has.call(events, name)) apply(events[name], this, slice.call(arguments,1))
  if (has.call(events, "all")) apply(events.all, this, arguments)
  return this
}

Concert.on = Concert.prototype.on
Concert.once = Concert.prototype.once
Concert.off = Concert.prototype.off
Concert.trigger = Concert.prototype.trigger

function unpack(on, self, obj, fn, context) {
  if (obj == null || typeof obj != "object") return
  for (var name in obj) on.call(self, name, obj[name], fn)
  return true
}

function apply(fns, context, args) {
  for (var i = 0, l = fns.length; i < l; ++i)
    fns[i][0].apply(fns[i][1] || context, args)
}
