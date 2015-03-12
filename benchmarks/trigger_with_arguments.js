var Concert = require("..")
var Benchmark = require("benchmark")
var benchmark = new Benchmark.Suite
var slice = Array.prototype.slice

var concert = new Concert
concert.on("all", noop)
concert.on("all", noop)
concert.on("all", noop)

var concertWithArguments = (function() {
  var show = Object.create(concert)

  show.trigger = function(name) {
    var evs = this._events
    if (evs == null) return this
    if (evs[name] != null) apply(evs[name], this, slice.call(arguments, 1))
    if (evs.all != null) apply(evs.all, this, arguments)
    return this
  }

  function apply(fns, thisArg, args) {
    for (var i = 0, l = fns.length; i < l; ++i)
      fns[i][0].apply(fns[i][1] || thisArg, args)
  }

  return show
})()

var concertWithSlice = (function() {
  var show = Object.create(concert)

  show.trigger = function(name) {
    var evs = this._events
    if (evs == null) return this
    if (evs[name] != null) apply(evs[name], this, slice.call(arguments, 1))
    if (evs.all != null) apply(evs.all, this, slice.call(arguments))
    return this
  }

  function apply(fns, thisArg, args) {
    for (var i = 0, l = fns.length; i < l; ++i)
      fns[i][0].apply(fns[i][1] || thisArg, args)
  }

  return show
})()

benchmark.add("Status quo", function() {
  concert.trigger("change", 1, 2, 3)
})

benchmark.add("Passing arguments to apply function", function() {
  concertWithArguments.trigger("change", 1, 2, 3)
})

benchmark.add("Converting arguments to an array before applying", function() {
  concertWithSlice.trigger("change", 1, 2, 3)
})

benchmark.on("cycle", function(ev) { console.log(String(ev.target)) })
benchmark.run()

function noop() {}
