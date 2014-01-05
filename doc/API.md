Concert.js API Documentation
============================
### [Concert](#Concert)
- [off](#Concert.off)(event, listener, context)
- [on](#Concert.on)(event, listener, context)
- [once](#Concert.once)(event, listener, context)
- [trigger](#Concert.trigger)(event, [arguments...])


<a name="Concert" />
Concert()
---------
Concert is the main object or *module* that you can inject into your own
objects to make them observables (also known as *event emitters* or
*dispatchers*). You can then listen to and trigger events on that object.

```javascript
var Concert = require("concert")
function Galaxy() {}
for (var name in Concert) Galaxy.prototype[name] = Concert[name]

var galaxy = new Galaxy()
galaxy.on("secret", console.log)
galaxy.trigger("secret", 42)
```

You can also create a new instance of `Concert` to get a blank object to
use as an *event bus*.
```javascript
var Concert = require("concert")
var bus = new Concert
bus.on("message", console.log)
bus.trigger("message", "One giant man to step, one small...")
```

If you need, you can also rename any `Concert`'s function by just assigning
them to new names on your object:
```javascript
obj.addEventListener = Concert.on
obj.emit = Concert.trigger
obj.removeEventListener = Concert.off
```

<a name="Concert.off" />
### Concert.off(event, listener, context)
Remove previously added listeners by event name, by function, by context or
by any combination.  
Returns `this`.

You can also specify **multiple events** at once by passing an object whose
keys are event names and values functions.  Pass `context` then as the 2nd
parameter.

**Examples**:
```javascript
// Remove all listeners:
obj.off()
// Remove listeners listening to event "foo":
obj.off("foo")
// Remove listeners fn of event "foo":
obj.off("foo", fn)
// Remove listener fn bound to context listening to event "foo":
obj.off("foo", fn, context) 
// Remove all listeners bound to context:
obj.off(null, null, context) 
// Remove all listeners fn listening to any event:
obj.off(null, fn) 
// Remove multiple listeners together:
obj.off({add: view.onAdd, remove: view.onRemove}, context)
```

<a name="Concert.on" />
### Concert.on(event, listener, context)
Add a `listener` for `event`.  
Optionally specify the listener's `context` (value of `this`). Defaults to
the global object or `undefined` under [strict mode][strict].  
Returns `this`.

You can also specify **multiple events** at once by passing an object whose
keys are event names and values functions.  Pass the optional `context`
then as the 2nd parameter.

Listen to the special `all` event to be called when any event is triggered:
`obj.on("all", function(event) {})`

The listener will be called with any arguments passed to
[`trigger`](#Concert.trigger).

[strict]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode

**Examples**:
```javascript
music.on("cowbell", function() { console.log("Cluck!") })
collection.on({add: view.onAdd, remove: view.onRemove}, view)
```

<a name="Concert.once" />
### Concert.once(event, listener, context)
Like [`on`](#Concert.on), but the listener is guaranteed to be called only
once.  
Returns `this`.

<a name="Concert.trigger" />
### Concert.trigger(event, [arguments...])
Trigger `event` and optionally pass any extra arguments to the listeners.  
Returns `this`.

Every event triggering also automatically triggers an `all` event with the
event name prepended to other arguments.

**Examples**:
```javascript
obj.trigger("change", 42, {previous: 69})
```
