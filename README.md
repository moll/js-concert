Concert.js
==========
[![NPM version][npm-badge]](http://badge.fury.io/js/concert)
[npm-badge]: https://badge.fury.io/js/concert.png

Concert.js is an **event library** for JavaScript and Node.js that implements
the **observer pattern** (a.k.a publish/subscribe). This is a useful pattern for
creating decoupled architectures, event driven systems and is one key element in
the [Model-View-Controller][mvc] pattern.  Concert.js similar to Node's
[EventEmitter][ee] and [Backbone.Events][bb-events], but **independent**,
**minimal** and **light-weight**.

[ee]: http://nodejs.org/api/events.html
[bb-events]: http://backbonejs.org/#Events
[mvc]: https://en.wikipedia.org/wiki/Model_View_Controller

### Tour
- **Simple** and **minimal** — just `on`, `once`, `off` and `trigger`.  
  No unnecessary method pollution or large API surface area like with other
  libraries. No legacy method names either.
- **Light-weight** with little code and **no external dependencies**.
- **Familiar** if you've ever used [Backbone.js][bb] or Node.js's
  [EventEmitter][ee].
- Comes with a built-in [`once`] function to listen to an event only once and
  then remove the listener automatically.  
- **Rename or alias** any function to a name of your choice.   
  Handy if you need to present a compatible or legacy API: `obj.addEventListener
  = Concert.on`.
- Special `all` event for catching all triggered events.  
  Useful also for **delegating or proxying** all events from one object to
  another.
- Add listeners for **multiple events at once** with object syntax:
  `obj.on({change: onChange, save: onSave})`
- Works well with namespaced event names such as `change:name`.  
  Because there's no limit to event names, you can easily create faux
  namespaces.
- Thoroughly tested.

[bb]: http://backbonejs.org
[`once`]: https://github.com/moll/js-concert/blob/master/doc/API.md#Concert.once


Installing
----------
### Installing on Node.js
```
npm install concert
```

### Installing for the browser
Concert.js doesn't yet have a build ready for the browser, but you might be able
to use [Browserify][browserify] to have it run there till then.

[browserify]: https://github.com/substack/node-browserify


Using
-----
To add events to any object of your choice, just mix `Concert`'s functions to
your object:
```javascript
var Concert = require("concert")
var music = {}
for (var name in Concert) music[name] = Concert[name]
```

Then use `on` and `trigger` to add listeners and trigger events:
```javascript
music.on("cowbell", function() { console.log("Cluck!") })
music.trigger("cowbell")
```

If you're using [Underscore.js][underscore] or [Lo-dash][lodash], you can use
`_.extend` to mix Concert in:
```javascript
_.extend(music, Concert)
```

[underscore]: http://underscorejs.org
[lodash]: http://lodash.com

### Adding events to all instances
Mix `Concert` in to your class's `prototype` to make each instance observable.
```javascript
function Music() {}
_.extend(Music.prototype, Concert)
```

Then you can listen to and trigger events on each instance.
```javascript
var music = new Music
music.on("cowbell", console.log)
```

### Faux namespaces
Because there are no limits to event names, you can create faux namespaces by
adding a separator, e.g `:`, to event names. Then trigger both the specific and
general version in your application code and you're good to go. This happens to
be also what [Backbone.Model][bb-model] does for its `change` events.

```javascript
model.trigger("change:name", "John")
model.trigger("change")
```

[bb-model]: http://backbonejs.org/#Model


API
---
For extended documentation on all functions, please see the [Concert.js API
Documentation][api].

[api]: https://github.com/moll/js-concert/blob/master/doc/API.md

### [Concert](https://github.com/moll/js-concert/blob/master/doc/API.md#Concert)
- [off](https://github.com/moll/js-concert/blob/master/doc/API.md#Concert.off)(event, listener, context)
- [on](https://github.com/moll/js-concert/blob/master/doc/API.md#Concert.on)(event, listener, context)
- [once](https://github.com/moll/js-concert/blob/master/doc/API.md#Concert.once)(event, listener, context)
- [trigger](https://github.com/moll/js-concert/blob/master/doc/API.md#Concert.trigger)(event, [arguments...])


License
-------
Concert.js is released under a *Lesser GNU Affero General Public License*, which
in summary means:

- You **can** use this program for **no cost**.
- You **can** use this program for **both personal and commercial reasons**.
- You **do not have to share your own program's code** which uses this program.
- You **have to share modifications** (e.g bug-fixes) you've made to this
  program.

For more convoluted language, see the `LICENSE` file.


About
-----
**[Andri Möll](http://themoll.com)** typed this and the code.  
[Monday Calendar](https://mondayapp.com) supported the engineering work.

If you find Concert.js needs improving, please don't hesitate to type to me now
at [andri@dot.ee][email] or [create an issue online][issues].

[email]: mailto:andri@dot.ee
[issues]: https://github.com/moll/js-concert/issues
