## Unreleased
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
