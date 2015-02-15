var slice = Array.prototype.slice
var has = Object.prototype.hasOwnProperty
var NAME_TYPE_ERR = "Event name should be a string"
var LISTENER_TYPE_ERR = "Event listener should be a function"
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
 * Optionally specify the listener's `this` value. Defaults to the object
 * the event was triggered on.  
 * Returns self.
 *
 * You can also specify **multiple events** at once by passing an object whose
 * keys are event names and values functions.  Pass the optional `this` then as
 * the 2nd parameter.
 *
 * Listen to the special `all` event to be called when any event is triggered:
 * ```javascript
 * obj.on("all", function(event) {})
 * ```
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
 * @param [thisArg]
 */
Concert.prototype.on = function on(name, fn, thisArg) {
  if (name == null) throw new TypeError(NAME_TYPE_ERR)
  if (unpack(on, this, name, fn, thisArg)) return this
  if (fn == null) throw new TypeError(LISTENER_TYPE_ERR)

  var events = this._events
  if (events == null || !has.call(this, "_events"))
    events = create(this, "_events", events)

  var fns = events[name]
  if (!has.call(events, name)) fns = events[name] = fns ? fns.slice() : []
  fns.push([fn, thisArg])
  return this
}

/**
 * Like [`on`](#Concert.on), but the listener is guaranteed to be called only
 * once.  
 * Returns self.
 *
 * @static
 * @method once
 * @param event
 * @param listener
 * @param [thisArg]
 */
Concert.prototype.once = function once(name, fn, thisArg) {
  if (name == null) throw new TypeError(NAME_TYPE_ERR)
  if (unpack(once, this, name, fn, thisArg)) return this
  if (fn == null) throw new TypeError(LISTENER_TYPE_ERR)

  function fnOnce() {
    Concert.prototype.off.call(this, name, fn)
    fn.apply(thisArg || this, arguments)
  }

  fnOnce.__func = fn
  fnOnce.__this = thisArg

  return Concert.prototype.on.call(this, name, fnOnce)
}

/**
 * Remove previously added listeners by event name, by listener, by `thisArg`
 * or by any combination.  
 * Returns self.
 *
 * You can also specify **multiple events** at once by passing an object whose
 * keys are event names and values functions.  Pass `thisArg` then as the 2nd
 * parameter.
 *
 * @example
 * // Remove all listeners:
 * obj.off()
 * // Remove listeners listening to event "foo":
 * obj.off("foo")
 * // Remove listeners fn of event "foo":
 * obj.off("foo", fn)
 * // Remove listener fn bound to thisArg listening to event "foo":
 * obj.off("foo", fn, thisArg)
 * // Remove all listeners bound to thisArg:
 * obj.off(null, null, thisArg)
 * // Remove all listeners fn listening to any event:
 * obj.off(null, fn)
 * // Remove multiple listeners together:
 * obj.off({add: view.onAdd, remove: view.onRemove}, thisArg)
 *
 * @static
 * @method off
 * @param event
 * @param listener
 * @param [thisArg]
 */
Concert.prototype.off = function off(name, fn, thisArg) {
  var events = this._events
  if (events == null) return this
  if (unpack(off, this, name, fn, thisArg)) return this

  if (fn == null && thisArg == null) {
    if (name == null)
      define(this, "_events", null)
    else if (events[name] != null) {
      if (!has.call(this, "_events")) events = create(this, "_events", events)
      else delete events[name]
      if (name in events) events[name] = null
    }
  }
  else {
    if (!has.call(this, "_events")) events = create(this, "_events", events)
    if (name != null) filter(events, name, fn, thisArg)
    else for (name in events) filter(events, name, fn, thisArg)
  }

  return this
}

/**
 * Trigger `event` and optionally pass any extra arguments to the listeners.  
 * Returns self.
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
  if (this._events == null) return this

  var events = this._events
  if (events[name]) apply(events[name], this, slice.call(arguments,1))
  if (events.all) apply(events.all, this, arguments)
  return this
}

Concert.on = Concert.prototype.on
Concert.once = Concert.prototype.once
Concert.off = Concert.prototype.off
Concert.trigger = Concert.prototype.trigger

function unpack(on, self, obj, fn, thisArg) {
  if (obj == null || typeof obj != "object") return
  for (var name in obj) on.call(self, name, obj[name], fn)
  return true
}

function define(obj, name, value) {
  Object.defineProperty(obj, name, {value: value, configurable: 1, writable: 1})
  return value
}

function create(obj, name, prototype) {
  return define(obj, name, Object.create(prototype || null))
}

function filter(events, name, fn, thisArg) {
  var fns = events[name]
  if (fns) events[name] = fns.filter(function(args) {
    if (fn != null && !hasFunction(args, fn)) return true
    if (thisArg != null && !hasThis(args, thisArg)) return true
    return false
  })
}

function hasFunction(args, fn) {
  return args[0] === fn || args[0].__func === fn
}

function hasThis(args, thisArg) {
  return (args[0].__this || args[1]) === thisArg
}

function apply(fns, thisArg, args) {
  for (var i = 0, l = fns.length; i < l; ++i)
    fns[i][0].apply(fns[i][1] || thisArg, args)
}
