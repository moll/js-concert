Concert.js
==========
[![NPM version][npm-badge]](http://badge.fury.io/js/concert)
[![Build status][travis-badge]](https://travis-ci.org/moll/js-concert)
[npm-badge]: https://badge.fury.io/js/concert.png
[travis-badge]: https://travis-ci.org/moll/js-concert.png?branch=master

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
- **Inheritable** — You can inherit from you observables and add
  listeners later.  
  All event listeners will initially be inherited and then copied only once you
  call `on`, `once` or `off` on the child instances. Eliminate an awful lot of
  computation by setting your event listeners on your class's prototype. Read
  more on [inheritable observables](#inheriting).
- **Familiar** if you've ever used [Backbone.js][bb] or Node.js's
  [EventEmitter][ee].
- Comes with a built-in [`once`] function to listen to an event only once and
  then remove the listener automatically.  
- **Rename or alias** any function to a name of your choice.   
  Handy if you need to present a compatible or legacy API:  
  `obj.addEventListener = Concert.on`.
- Special `all` event for catching all triggered events.  
  Useful also for **delegating or proxying** all events from one object to
  another.
- Add listeners for **multiple events at once** with object syntax:  
  `obj.on({change: onChange, save: onSave})`
- Works well with namespaced event names such as `change:name`.  
  Because there's no limit to event names, you can easily create faux
  namespaces.
- Supports **ECMAScript 6's [Symbol][symbol]** in case you need to create events
  a little more private.  
  But really, that's an illusion. There's `Object.getOwnPropertySymbols`.
- Thoroughly tested.

[bb]: http://backbonejs.org
[`once`]: https://github.com/moll/js-concert/blob/master/doc/API.md#Concert.once
[symbol]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Symbol


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

### Enabling Concert on all instances
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

### Faux Namespaces
Because there are no limits to event names, you can create faux namespaces by
adding a separator, e.g `:`, to event names. Then trigger both the specific and
general version in your application code and you're good to go. This happens to
be also what [Backbone.Model][bb-model] does for its `change` events.

```javascript
model.trigger("change:name", "John")
model.trigger("change")
```

[bb-model]: http://backbonejs.org/#Model

<a name="inheriting" />
### Inheritable Observables
Concert.js supports inheriting from your observables without worrying you'll
change the prototypes. Set up your event listeners once on your "class's"
prototype and then, if need be, add or remove listeners.

```javascript
function Music(song) { this.song = song }

_.extend(Music.prototype, Concert)

Music.prototype.play = function() { this.trigger("play", this.song) }

Music.prototype.on("play", console.log.bind(null, "Playing %s."))
```

Once you initialize your object, all of the event listeners will be ready
without having to call a bunch of `on`s and `once`s in the constructor. This
pattern saves you from an awful lot of unnecessary computation.

```javascript
var music = new Music("On Broadway")
music.play() // => Will log "Playing On Broadway.".
```

You can then add listeners without worrying you'll change every instance in the
system (as you would when you'd use Node.js's EventEmitter or Backbone's
Events).

```javascript
var jam = new Music("The Way It Is")
jam.off("play")
jam.on("play", console.log.bind(null, "Jamming %s."))
music.play() // => Will log "Jamming The Way It Is.".

var classic = new Music("Tubular Bells")
classic.play() // => Will still log "Playing Tubular Bells.".
```


API
---
For extended documentation on all functions, please see the
[Concert.js API Documentation][api].

[api]: https://github.com/moll/js-concert/blob/master/doc/API.md

### [Concert](https://github.com/moll/js-concert/blob/master/doc/API.md#Concert)
- [off](https://github.com/moll/js-concert/blob/master/doc/API.md#Concert.off)(event, listener, [thisArg])
- [on](https://github.com/moll/js-concert/blob/master/doc/API.md#Concert.on)(event, listener, [thisArg])
- [once](https://github.com/moll/js-concert/blob/master/doc/API.md#Concert.once)(event, listener, [thisArg])
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
