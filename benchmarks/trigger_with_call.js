var Concert = require("..")
var Benchmark = require("benchmark")
var benchmark = new Benchmark.Suite
var slice = Array.prototype.slice

var concert = new Concert
concert.on("change", noop)
concert.on("change", noop)
concert.on("change", noop)

var concertWithApply = (function() {
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

var concertWithApplyOptimization = (function() {
  var show = Object.create(concert)

  show.trigger = function(name) {
    var evs = this._events
    if (evs == null) return this
    if (evs[name] != null) apply(evs[name], this, slice.call(arguments, 1))
    if (evs.all != null) apply(evs.all, this, arguments)
    return this
  }

  function apply(fns, thisArg, args) {
    for (var i = 0, l = fns.length, fn; i < l; ++i) {
      (fn = fns[i])[0].apply(fn[1] || thisArg, args)
    }
  }

  return show
})()

var concertWithCall = (function() {
  var show = Object.create(concert)

  show.trigger = function(name) {
    var evs = this._events
    if (evs == null) return this
    if (evs[name] != null) apply(evs[name], this, slice.call(arguments, 1))
    if (evs.all != null) apply(evs.all, this, slice.call(arguments))
    return this
  }

  function apply(fns, thisArg, args) {
    var fn
    var i = -1
    var l = fns.length
    var a = args[0]
    var b = args[1]
    var c = args[2]

    switch (args.length) {
      case 0:
        while (++i < l) (fn = fns[i])[0].call(fn[1] || thisArg); break
      case 1:
        while (++i < l) (fn = fns[i])[0].call(fn[1] || thisArg, a); break
      case 2:
        while (++i < l) (fn = fns[i])[0].call(fn[1] || thisArg, a, b); break
      case 3:
        while (++i < l) (fn = fns[i])[0].call(fn[1] || thisArg, a, b, c); break
      default:
        while (++i < l) (fn = fns[i])[0].apply(fn[1] || thisArg, args)
    }
  }

  return show
})()

benchmark.add("Status quo", function() {
  concert.trigger("change", 1)
  concert.trigger("change", 1, 2)
  concert.trigger("change", 1, 2, 3)
})

benchmark.add("Function.prototype.apply", function() {
  concertWithApply.trigger("change", 1)
  concertWithApply.trigger("change", 1, 2)
  concertWithApply.trigger("change", 1, 2, 3)
})

benchmark.add("Function.prototype.apply with reference to element", function() {
  concertWithApplyOptimization.trigger("change", 1)
  concertWithApplyOptimization.trigger("change", 1, 2)
  concertWithApplyOptimization.trigger("change", 1, 2, 3)
})

benchmark.add("Function.prototype.call for <= 3 arguments", function() {
  concertWithCall.trigger("change", 1)
  concertWithCall.trigger("change", 1, 2)
  concertWithCall.trigger("change", 1, 2, 3)
})

benchmark.on("cycle", function(ev) { console.log(String(ev.target)) })
benchmark.run()

function noop() {}
