Concert.js API Documentation
============================
### [Concert](#Concert)
- [.off](#Concert.off)(event, listener, [thisArg])
- [.on](#Concert.on)(event, listener, [thisArg], [arguments...])
- [.once](#Concert.once)(event, listener, [thisArg], [arguments...])
- [.trigger](#Concert.trigger)(event, [arguments...])


Concert() <a name="Concert"></a>
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

### Concert.off(event, listener, [thisArg]) <a name="Concert.off"></a>
Remove previously added listeners by event name, by listener, by `thisArg`
or by any combination.  
Returns self.

You can also specify **multiple events** at once by passing an object whose
keys are event names and values functions.  Pass `thisArg` then as the 2nd
parameter.

**Examples**:
```javascript
// Remove all listeners:
obj.off()
// Remove listeners listening to event "foo":
obj.off("foo")
// Remove listeners fn of event "foo":
obj.off("foo", fn)
// Remove listener fn bound to thisArg listening to event "foo":
obj.off("foo", fn, thisArg)
// Remove all listeners bound to thisArg:
obj.off(null, null, thisArg)
// Remove all listeners fn listening to any event:
obj.off(null, fn)
// Remove multiple listeners together:
obj.off({add: view.onAdd, remove: view.onRemove}, thisArg)
```

### Concert.on(event, listener, [thisArg], [arguments...]) <a name="Concert.on"></a>
Add a `listener` for `event`.  
Optionally specify the listener's `this` value. Defaults to the object
the event was triggered on when left undefined.  
Optionally specify additional arguments to be passed to the listener.  
Returns self.

You can also specify **multiple events** at once by passing an object whose
keys are event names and values functions.  Pass the optional `this` then as
the 2nd parameter.

Listen to the special `all` event to be called when any event is triggered:
```javascript
obj.on("all", function(event) {})
```

The listener will be called with any arguments passed to
[`trigger`](#Concert.trigger).

**Examples**:
```javascript
music.on("cowbell", function() { console.log("Cluck!") })
collection.on({add: view.onAdd, remove: view.onRemove}, view)
model.on("change:name", view.onChange, view, "name")
```

### Concert.once(event, listener, [thisArg], [arguments...]) <a name="Concert.once"></a>
Like [`on`](#Concert.on), but the listener is guaranteed to be called only
once.  
Returns self.

### Concert.trigger(event, [arguments...]) <a name="Concert.trigger"></a>
Trigger `event` and optionally pass any extra arguments to the listeners.  
Returns self.

Every event triggering also automatically triggers an `all` event with the
event name prepended to other arguments.

**Examples**:
```javascript
obj.trigger("change", 42, {previous: 69})
```
