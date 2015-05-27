## Unreleased
- Allows binding a listener's `thisArg` to `null`.  

  Using `null` will mean the event listner will be called in the `null` context.
  In [JavaScript's strict mode][strict] that means `this === null`.  
  ```javascript
  model.on("change", onChange, null)
  ```

  As before, using `undefined` or leaving the context out will mean the event
  listener will be called in the object's context. This is most useful when
  setting up listeners on the object's prototype as v2.0.0 featured:
  ```javascript
  Model.prototype.on("change", fn)
  ```

[strict]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode

## 2.0.1 (Feb 15, 2015)
- Fixes rebinding to events named like `Object.prototype`'s properties after
  unbinding all.
- Fixes rebinding an inherited event that was previously unbound.
- Deletes an empty listener array from `_events` when the last event is unbound.

## 2.0.0 (Feb 13, 2015)
- You can now inherit from objects and change their event listeners without
  affecting object prototypes.

  All event listeners will initially be inherited and then copied only once you
  call `on`, `once` or `off` on the child instances. For most use-cases you can
  initialize your event listeners only once, e.g. on your class's prototype, and
  then rely on inheritance to make them available. Eliminates an awful lot of
  redundant computation.

  See the [README][] for more info on [inheritable
  observables](https://github.com/moll/js-concert#inheriting).

- Throws `TypeError` when `on` or `once` called without a name.
- Throws `TypeError` when `on` or `once` called without a listener function.

[README]: https://github.com/moll/js-concert

## 1.2.0 (Sep 29, 2014)
- `Concert.prototype.off` no longer deletes `this._events`, but sets it to
  `null`.  
  This allows for easier inheriting from an object that has `_events` set ---
  parent's events won't be unshadowed by accident.

## 1.1.0 (Jul 16, 2014)
- Calls event handlers in the context of the object by default if a context
  wasn't explicitly set.  
  This matches how Backbone.js's, Node.js's EventEmitter and DOM event handlers
  work.

## 1.0.0 (Mar 21, 2014)
- Defines the internal `_events` property as [non-enumerable][for-in].

[for-in]: http://www.ecma-international.org/ecma-262/5.1/#sec-12.6.4

## 0.1.338 (Jan 5, 2014)
- Allows using event names that exist on `Object.prototype`.

## 0.1.337 (Oct 25, 2013)
- First release. The show must go on!
