var _ = require("underscore")
var Sinon = require("sinon")
var Concert = require("..")

describe("Concert", function() {
  function create() { return _.extend({}, Concert) }

  it("must only have public API as enumerable properties", function() {
    Concert.must.have.keys(["on", "once", "off", "trigger"])
  })

  describe(".on", function() {
    it("must be renameable", function() {
      var obj = create()
      obj.addEventListener = obj.on
      delete obj.on

      var fn = Sinon.spy(), context = {}
      obj.addEventListener("foo", fn, context)
      obj.trigger("foo")
      fn.firstCall.thisValue.must.equal(context)
    })

    // This was a bug in v0.1.337.
    it("must allow names of Object.prototype's properties", function() {
      var obj = create()
      var fn = Sinon.spy()
      obj.on("hasOwnProperty", fn)
      obj.trigger("hasOwnProperty")
      fn.callCount.must.equal(1)
    })

    it("must inherit parent's events without changing parent", function() {
      var obj = create()
      var child = Object.create(obj)

      var a = Sinon.spy()
      obj.on("foo", a)
      var b = Sinon.spy()
      child.on("foo", b)

      child.trigger("foo")
      a.callCount.must.equal(1)
      b.callCount.must.equal(1)

      obj.trigger("foo")
      a.callCount.must.equal(2)
      b.callCount.must.equal(1)
    })

    it("must bind to inherited object by default", function() {
      var obj = create()
      var child = Object.create(obj)

      var a = Sinon.spy()
      obj.on("foo", a)
      var b = Sinon.spy()
      child.on("foo", b)

      child.trigger("foo")
      a.thisValues[0].must.equal(child)
      b.thisValues[0].must.equal(child)
    })

    it("must not inherit parent's events after calling off", function() {
      var obj = create()
      var child = Object.create(obj)

      var a = Sinon.spy()
      obj.on("foo", a)
      var b = Sinon.spy()
      child.on("foo", b)
      child.off()

      child.on("foo", b)
      child.trigger("foo")
      a.callCount.must.equal(0)
      b.callCount.must.equal(1)
    })

    it("must create non-enumerable this._events", function() {
      var obj = create()
      obj.on("foo", function() {})
      obj.must.have.nonenumerable("_events")
    })

    // This was a bug on Feb 15, 2015 related to setting _events to an object
    // inheriting from Object.prototype when it already existed on the object,
    // rather than null as usual.
    it("must bind to Object.prototype's property after unbinding all",
      function(){
      var obj = create()
      obj.on("foo", function() {})
      obj.off()

      var fn = Sinon.spy()
      obj.on("hasOwnProperty", fn)
      obj.trigger("hasOwnProperty")
      fn.callCount.must.equal(1)
    })

    it("must bind after unbinding an inherited event", function(){
      var obj = create()
      function onFoo() {}
      obj.on("foo", onFoo)

      var child = Object.create(obj)
      child.off("foo", onFoo)

      var fn = Sinon.spy()
      child.on("foo", fn)
      child.trigger("foo")
      fn.callCount.must.equal(1)
    })

    it("must bind after unbinding an inherited event and function", function(){
      var obj = create()
      obj.on("foo", function() {})

      var child = Object.create(obj)
      child.off("foo", fn)

      var fn = Sinon.spy()
      child.on("foo", fn)
      child.trigger("foo")
      fn.callCount.must.equal(1)
    })

    describe("given nothing", function() {
      it("must throw TypeError", function() {
        var obj = create()
        var err
        try { obj.on() } catch (ex) { err = ex }
        err.must.be.an.instanceof(TypeError)
        err.message.must.match(/name/i)
        obj.must.not.have.property("_events")
      })
    })

    describe("given only name", function() {
      it("must throw TypeError", function() {
        var obj = create()
        var err
        try { obj.on("foo") } catch (ex) { err = ex }
        err.must.be.an.instanceof(TypeError)
        err.message.must.match(/function/i)
      })
    })

    describe("given name and function", function() {
      it("must return self", function() {
        var obj = create()
        obj.on("foo", function() {}).must.equal(obj)
      })

      it("must bind", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn)
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must bind to object context by default", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn).trigger("foo")
        fn.firstCall.thisValue.must.equal(obj)
      })

      it("must bind twice if called again", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn)
        obj.on("foo", fn)
        obj.trigger("foo")
        fn.callCount.must.equal(2)
      })

      it("must bind given 0 name", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on(0, fn)
        obj.trigger("0")
        fn.callCount.must.equal(1)
      })
    })

    describe("given name, function and context", function() {
      it("must bind", function() {
        var obj = create()
        var context = {}
        var fn = Sinon.spy()
        obj.on("foo", fn, context)
        obj.trigger("foo")
        fn.firstCall.thisValue.must.equal(context)
      })

      it("must bind to object context given undefined context", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn, undefined).trigger("foo")
        fn.firstCall.thisValue.must.equal(obj)
      })

      it("must bind to object context given null context", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn, null).trigger("foo")
        fn.firstCall.thisValue.must.equal(obj)
      })
    })

    describe("given object", function() {
      it("must return self", function() {
        var obj = create()
        obj.on({foo: function() {}}).must.equal(obj)
      })

      it("must bind all given", function() {
        var obj = create()
        var foo = Sinon.spy(), bar = Sinon.spy()
        obj.on({foo: foo, bar: bar})
        obj.trigger("foo")
        foo.callCount.must.equal(1)
        bar.callCount.must.equal(0)
        obj.trigger("bar")
        foo.callCount.must.equal(1)
        bar.callCount.must.equal(1)
      })

      it("must bind to object context by default", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on({foo: fn}).trigger("foo")
        fn.firstCall.thisValue.must.equal(obj)
      })

      it("must throw TypeError given null for a function", function() {
        var obj = create()
        var err
        try { obj.on({foo: null}) } catch (ex) { err = ex }
        err.must.be.an.instanceof(TypeError)
        err.message.must.match(/function/i)
        obj.must.not.have.property("_events")
      })
    })

    describe("given object and context", function() {
      it("must bind", function() {
        var obj = create()
        var context = {}
        var fn = Sinon.spy()
        obj.on({foo: fn}, context)
        obj.trigger("foo")
        fn.firstCall.thisValue.must.equal(context)
      })

      it("must bind to object context given undefined context", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on({foo: fn}, undefined).trigger("foo")
        fn.firstCall.thisValue.must.equal(obj)
      })

      it("must bind to object context given null context", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on({foo: fn}, null).trigger("foo")
        fn.firstCall.thisValue.must.equal(obj)
      })
    })
  })

  describe(".once", function() {
    // Not working as expected yet with the inheritance support.
    xit("must not call twice when event triggered from handler", function() {
      var obj = create()
      var fn = Sinon.spy()
      obj.on("foo", _.once(function() { obj.trigger("foo") }))
      obj.once("foo", fn)
      obj.trigger("foo")
      fn.callCount.must.equal(1)
    })

    describe("given nothing", function() {
      it("must throw TypeError", function() {
        var obj = create()
        var err
        try { obj.once() } catch (ex) { err = ex }
        err.must.be.an.instanceof(TypeError)
        err.message.must.match(/name/i)
        obj.must.not.have.property("_events")
      })
    })

    describe("given only name", function() {
      it("must throw TypeError", function() {
        var obj = create()
        var err
        try { obj.once("foo") } catch (ex) { err = ex }
        err.must.be.an.instanceof(TypeError)
        err.message.must.match(/function/i)
        obj.must.not.have.property("_events")
      })
    })

    describe("given name and function", function() {
      it("must return self", function() {
        var obj = create()
        obj.once("foo", function() {}).must.equal(obj)
      })

      it("must bind once", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.once("foo", fn)
        obj.trigger("foo")
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must bind to object context by default", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.once("foo", fn)
        obj.trigger("foo")
        fn.firstCall.thisValue.must.equal(obj)
      })

      it("must bind to object context by default when inherited", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.once("foo", fn)
        var child = Object.create(obj)
        child.trigger("foo")
        fn.firstCall.thisValue.must.equal(child)
      })

      it("must bind once when inherited", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.once("foo", fn)

        var child = Object.create(obj)
        child.trigger("foo")
        child.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must not change the parent when called on child", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.once("foo", fn)

        var child = Object.create(obj)
        child.trigger("foo")

        obj.trigger("foo")
        fn.callCount.must.equal(2)
      })

      it("must bind twice if called again", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.once("foo", fn)
        obj.once("foo", fn)
        obj.trigger("foo")
        fn.callCount.must.equal(2)
      })

      it("must not affect other events by same name", function() {
        var obj = create()
        var fn = Sinon.spy()
        var other = Sinon.spy()
        obj.once("foo", fn)
        obj.on("foo", other)
        obj.trigger("foo")
        obj.trigger("foo")
        other.callCount.must.equal(2)
      })
    })

    describe("given name, function and context", function() {
      it("must bind", function() {
        var obj = create()
        var context = {}
        var fn = Sinon.spy()
        obj.once("foo", fn, context)
        obj.trigger("foo")
        fn.firstCall.thisValue.must.equal(context)
      })

      it("must bind once", function() {
        var obj = create()
        var context = {}
        var fn = Sinon.spy()
        obj.once("foo", fn, context)
        obj.trigger("foo")
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must bind to object context given undefined context", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.once("foo", fn, undefined).trigger("foo")
        fn.firstCall.thisValue.must.equal(obj)
      })

      it("must bind to object context given null context", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.once("foo", fn, null).trigger("foo")
        fn.firstCall.thisValue.must.equal(obj)
      })
    })

    describe("given object", function() {
      it("must return self", function() {
        var obj = create()
        obj.once({foo: function() {}}).must.equal(obj)
      })

      it("must bind all given", function() {
        var obj = create()
        var foo = Sinon.spy(), bar = Sinon.spy()
        obj.once({foo: foo, bar: bar})
        obj.trigger("foo")
        foo.callCount.must.equal(1)
        bar.callCount.must.equal(0)
        obj.trigger("bar")
        foo.callCount.must.equal(1)
        bar.callCount.must.equal(1)
      })

      it("must bind once", function() {
        var obj = create()
        var foo = Sinon.spy(), bar = Sinon.spy()
        obj.once({foo: foo, bar: bar})
        obj.trigger("foo")
        obj.trigger("foo")
        obj.trigger("bar")
        obj.trigger("bar")
        foo.callCount.must.equal(1)
        bar.callCount.must.equal(1)
      })

      it("must bind to object context by default", function() {
        var obj = create()
        obj.once({foo: function() { this.must.equal(obj) }}).trigger("foo")
      })

      it("must throw TypeError given null for a function", function() {
        var obj = create()
        var err
        try { obj.once({foo: null}) } catch (ex) { err = ex }
        err.must.be.an.instanceof(TypeError)
        err.message.must.match(/function/i)
        obj.must.not.have.property("_events")
      })
    })

    describe("given object and context", function() {
      it("must bind", function() {
        var obj = create()
        var context = {}
        var fn = Sinon.spy()
        obj.once({foo: fn}, context)
        obj.trigger("foo")
        fn.firstCall.thisValue.must.equal(context)
      })

      it("must bind to object context given undefined context", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.once({foo: fn}, undefined).trigger("foo")
        fn.firstCall.thisValue.must.equal(obj)
      })

      it("must bind to object context given null context", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.once({foo: fn}, null).trigger("foo")
        fn.firstCall.thisValue.must.equal(obj)
      })
    })

    it("must be renameable", function() {
      var obj = create()
      obj.addEventListenerOnce = obj.once
      delete obj.once

      var fn = Sinon.spy()
      obj.addEventListenerOnce("foo", fn)
      obj.trigger("foo")
      obj.trigger("foo")
      fn.callCount.must.equal(1)
    })

    it("must be renameable with both Concert.on and Concert.off", function() {
      var obj = create()
      obj.addEventListener = obj.on
      delete obj.on
      obj.addEventListenerOnce = obj.once
      delete obj.once
      obj.removeEventListener = obj.off
      delete obj.off

      var fn = Sinon.spy()
      obj.addEventListenerOnce("foo", fn)
      obj.trigger("foo")
      obj.trigger("foo")
      fn.callCount.must.equal(1)
    })
  })

  describe(".off", function() {
    describe("given nothing", function() {
      it("must return self", function() {
        var obj = create()
        obj.off().must.equal(obj)
      })

      it("must not create this._events if it didn't exist", function() {
        var obj = create()
        obj.off()
        obj.must.not.have.property("_events")
      })

      it("must unbind all", function() {
        var obj = create()
        var fn1 = Sinon.spy(), fn2 = Sinon.spy()
        obj.on("foo", fn1)
        obj.on("bar", fn2)
        obj.off()
        obj.trigger("foo")
        obj.trigger("bar")
        fn1.callCount.must.equal(0)
        fn2.callCount.must.equal(0)
      })

      it("must unbind inherited events without changing parent", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn)

        var child = Object.create(obj)
        child.off()
        child.trigger("foo")
        fn.callCount.must.equal(0)

        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must unbind inherited and own events without changing parent",
        function() {
        var obj = create()
        var child = Object.create(obj)

        var a = Sinon.spy()
        obj.on("foo", a)
        var b = Sinon.spy()
        child.on("foo", b)

        child.off()
        child.trigger("foo")
        a.callCount.must.equal(0)
        b.callCount.must.equal(0)

        obj.trigger("foo")
        a.callCount.must.equal(1)
      })

      it("must create non-enumerable this._events given inherited events",
        function() {
        var obj = create()
        obj.on("foo", function() {})
        var child = Object.create(obj)
        child.off()
        child.must.have.nonenumerable("_events")
      })
    })

    describe("given name", function() {
      it("must return self", function() {
        var obj = create()
        obj.off("foo").must.equal(obj)
      })

      it("must not create this._events if it didn't exist", function() {
        var obj = create()
        obj.off("foo")
        obj.must.not.have.property("_events")
      })

      it("must unbind", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn)
        obj.off("foo")
        obj.trigger("foo")
        fn.callCount.must.equal(0)
      })

      it("must not unbind others with different names", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn)
        obj.off("bar")
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must not unbind others with different names given 0", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn)
        obj.off(0)
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must unbind inherited events without changing parent", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn)

        var child = Object.create(obj)
        child.off("foo")
        child.trigger("foo")
        fn.callCount.must.equal(0)

        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must unbind inherited and own events without changing parent",
        function() {
        var obj = create()
        var child = Object.create(obj)

        var a = Sinon.spy()
        obj.on("foo", a)
        var b = Sinon.spy()
        child.on("foo", b)

        child.off("foo")
        child.trigger("foo")
        a.callCount.must.equal(0)
        b.callCount.must.equal(0)

        obj.trigger("foo")
        a.callCount.must.equal(1)
      })

      it("must create non-enumerable this._events given inherited events",
        function() {
        var obj = create()
        obj.on("foo", function() {})
        var child = Object.create(obj)
        child.off("foo")
        child.must.have.nonenumerable("_events")
      })
    })

    describe("given name and function", function() {
      it("must return self", function() {
        var obj = create()
        obj.off("foo", function() {}).must.equal(obj)
      })

      it("must not create this._events if it didn't exist", function() {
        var obj = create()
        obj.off("foo", function() {})
        obj.must.not.have.property("_events")
      })

      it("must unbind", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn)
        obj.off("foo", fn)
        obj.trigger("foo")
        fn.callCount.must.equal(0)
      })

      it("must not unbind others with different functions", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn)
        obj.off("foo", function() {})
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must not unbind others with different names", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn)
        obj.off("bar", fn)
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must not unbind others with different names given 0", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn)
        obj.off(0, fn)
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must unbind functions bound with \"once\"", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.once("foo", fn)
        obj.off("foo", fn)
        obj.trigger("foo")
        fn.callCount.must.equal(0)
      })

      it("must unbind functions bound both with \"on\" & \"once\"", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn)
        obj.once("foo", fn)
        obj.off("foo", fn)
        obj.trigger("foo")
        fn.callCount.must.equal(0)
      })

      it("must unbind inherited events without changing parent", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn)

        var child = Object.create(obj)
        child.off("foo", fn)
        child.trigger("foo")
        fn.callCount.must.equal(0)

        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must unbind inherited and own events without changing parent",
        function() {
        var obj = create()
        var child = Object.create(obj)

        var fn = Sinon.spy()
        obj.on("foo", fn)
        child.on("foo", fn)

        child.off("foo", fn)
        child.trigger("foo")
        fn.callCount.must.equal(0)

        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })
    })

    describe("given name and context", function() {
      it("must unbind", function() {
        var obj = create()
        var context = {}
        var fn = Sinon.spy()
        obj.on("foo", function() {}, context)
        obj.off("foo", null, context)
        obj.trigger("foo")
        fn.callCount.must.equal(0)
      })

      it("must not unbind others with different contexts", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn, {})
        obj.off("foo", null, {})
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must not unbind others with different names", function() {
        var obj = create()
        var context = {}
        var fn = Sinon.spy()
        obj.on("foo", fn, context)
        obj.off("bar", null, context)
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must unbind given undefined context", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn, undefined)
        obj.off("foo", null, undefined)
        obj.trigger("foo")
        fn.callCount.must.equal(0)
      })

      it("must unbind given null context", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn, null)
        obj.off("foo", null, null)
        obj.trigger("foo")
        fn.callCount.must.equal(0)
      })

      it("must unbind undefined contexts given null context", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn, undefined)
        obj.off("foo", null, null)
        obj.trigger("foo")
        fn.callCount.must.equal(0)
      })

      it("must unbind null contexts given undefined context", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn, null)
        obj.off("foo", null, undefined)
        obj.trigger("foo")
        fn.callCount.must.equal(0)
      })
    })

    describe("given name, function and context", function() {
      it("must return self", function() {
        var obj = create()
        obj.off("foo", function() {}, {}).must.equal(obj)
      })

      it("must unbind", function() {
        var obj = create()
        var context = {}
        var fn = Sinon.spy()
        obj.on("foo", fn, context)
        obj.off("foo", fn, context)
        obj.trigger("foo")
        fn.callCount.must.equal(0)
      })

      it("must unbind functions bound with \"once\"", function() {
        var obj = create()
        var context = {}
        var fn = Sinon.spy()
        obj.once("foo", fn, context)
        obj.off("foo", fn, context)
        obj.trigger("foo")
        fn.callCount.must.equal(0)
      })

      it("must not unbind others with different functions", function() {
        var obj = create()
        var context = {}
        var fn = Sinon.spy()
        obj.on("foo", fn, context)
        obj.off("foo", function() {}, context)
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must not unbind others with different contexts", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn, {})
        obj.off("foo", fn, {})
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })
    })

    describe("given function", function() {
      it("must unbind undefined context if given null", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn, undefined)
        obj.off(null, fn, null)
        obj.trigger("foo")
        fn.callCount.must.equal(0)
      })

      it("must unbind functions bound with \"once\"", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.once("foo", fn)
        obj.off(null, fn)
        obj.trigger("foo")
        fn.callCount.must.equal(0)
      })

      it("must unbind null context if given undefined", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn, null)
        obj.off(null, fn, undefined)
        obj.trigger("foo")
        fn.callCount.must.equal(0)
      })

      it("must unbind inherited events without changing parent", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn)

        var child = Object.create(obj)
        child.off(null, fn)
        child.trigger("foo")
        fn.callCount.must.equal(0)

        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must unbind inherited and own events without changing parent",
        function() {
        var obj = create()
        var child = Object.create(obj)

        var fn = Sinon.spy()
        obj.on("foo", fn)
        child.on("foo", fn)

        child.off(null, fn)
        child.trigger("foo")
        fn.callCount.must.equal(0)

        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })
    })

    describe("given function and context", function() {
      it("must unbind", function() {
        var obj = create()
        var context = {}
        var fn = Sinon.spy()
        obj.on("foo", fn, context)
        obj.off(null, fn, context)
        obj.trigger("foo")
        fn.callCount.must.equal(0)
      })

      it("must unbind functions bound with \"once\"", function() {
        var obj = create()
        var context = {}
        var fn = Sinon.spy()
        obj.once("foo", fn, context)
        obj.off(null, fn, context)
        obj.trigger("foo")
        fn.callCount.must.equal(0)
      })

      it("must not unbind others with different functions", function() {
        var obj = create()
        var context = {}
        var fn = Sinon.spy()
        obj.on("foo", fn, context)
        obj.off(null, function() {}, context)
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must not unbind others with different contexts", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn, {})
        obj.off(null, fn, {})
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })
    })

    describe("given object", function() {
      it("must return self", function() {
        var obj = create()
        obj.off({foo: function() {}}).must.equal(obj)
      })

      it("must unbind all given", function() {
        var obj = create()
        var foo = Sinon.spy(), bar = Sinon.spy()
        obj.on({foo: foo, bar: bar})
        obj.off({foo: foo, bar: bar})
        obj.trigger("foo")
        obj.trigger("bar")
        foo.callCount.must.equal(0)
        bar.callCount.must.equal(0)
      })

      it("must not unbind others with different functions", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on({foo: fn})
        obj.off({foo: function() {}})
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must not unbind others with different names", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on({foo: fn})
        obj.off({bar: fn})
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })
    })

    describe("given object and context", function() {
      it("must unbind all given", function() {
        var obj = create()
        var context = {}
        var foo = Sinon.spy(), bar = Sinon.spy()
        obj.on({foo: foo, bar: bar}, context)
        obj.off({foo: foo, bar: bar}, context)
        obj.trigger("foo")
        obj.trigger("bar")
        foo.callCount.must.equal(0)
        bar.callCount.must.equal(0)
      })

      it("must not unbind others with different functions", function() {
        var obj = create()
        var context = {}
        var fn = Sinon.spy()
        obj.on({foo: fn}, context)
        obj.off({foo: function() {}}, context)
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must not unbind others with different names", function() {
        var obj = create()
        var context = {}
        var fn = Sinon.spy()
        obj.on({foo: fn}, context)
        obj.off({bar: fn}, context)
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must not unbind others with different contexts", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on({foo: fn}, {})
        obj.off({foo: fn}, {})
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })
    })

    describe("given context", function() {
      it("must unbind", function() {
        var obj = create()
        var context = {}
        var fn = Sinon.spy()
        obj.on("foo", fn, context)
        obj.off(null, null, context)
        obj.trigger("foo")
        fn.callCount.must.equal(0)
      })

      it("must unbind functions bound with \"once\"", function() {
        var obj = create()
        var context = {}
        var fn = Sinon.spy()
        obj.once("foo", fn, context)
        obj.off(null, null, context)
        obj.trigger("foo")
        fn.callCount.must.equal(0)
      })

      it("must not unbind others with different contexts", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn, {})
        obj.off(null, null, {})
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })
    })

    it("must be renameable", function() {
      var obj = create()
      obj.removeEventListener = obj.off
      delete obj.off

      var fn = Sinon.spy()
      obj.on("foo", fn)
      obj.removeEventListener("foo")
      obj.trigger("foo")
      fn.callCount.must.equal(0)
    })

    it("must unbind bound name of Object.prototype's properties", function() {
      var obj = create()
      var fn = Sinon.spy()
      obj.on("hasOwnProperty", fn)
      obj.off("hasOwnProperty", fn)
      obj.trigger("hasOwnProperty")
      fn.callCount.must.equal(0)
    })

    it("must ignore names of Object.prototype's properties", function() {
      var obj = create()
      obj.off.bind(obj, "hasOwnProperty", function() {}).must.not.throw()
    })
  })

  describe(".trigger", function() {
    it("must return self", function() {
      var obj = create()
      obj.on("foo", function() {})
      obj.trigger("foo").must.equal(obj)
    })

    it("must return self even if this._events doesn't exist", function() {
      var obj = create()
      obj.trigger("foo").must.equal(obj)
    })

    it("must return self if no matching event", function() {
      var obj = create()
      obj.on("bar", function() {})
      obj.trigger("foo").must.equal(obj)
    })

    it("must trigger event", function() {
      var obj = create()
      var fn = Sinon.spy()
      obj.on("foo", fn)
      obj.trigger("foo")
      fn.callCount.must.equal(1)
      fn.firstCall.args.must.be.empty()
    })

    it("must trigger inherited event", function() {
      var obj = create()
      var fn = Sinon.spy()
      obj.on("foo", fn)
      Object.create(obj).trigger("foo")
      fn.callCount.must.equal(1)
    })

    it("must not trigger other events", function() {
      var obj = create()
      var fn = Sinon.spy()
      var other = Sinon.spy()
      obj.on("foo", fn)
      obj.on("bar", other)
      obj.trigger("foo")
      other.callCount.must.equal(0)
    })

    it("must trigger event named 0", function() {
      var obj = create()
      var fn = Sinon.spy()
      obj.on(0, fn)
      obj.trigger(0)
      fn.callCount.must.equal(1)
    })

    it("must trigger \"all\" event with event name", function() {
      var obj = create()
      var fn = Sinon.spy()
      obj.on("all", fn)
      obj.trigger("foo")
      fn.callCount.must.equal(1)
      fn.firstCall.args.must.eql(["foo"])
    })

    it("must trigger \"all\" for inherited events", function() {
      var obj = create()
      var fn = Sinon.spy()
      obj.on("all", fn)
      Object.create(obj).trigger("foo")
      fn.callCount.must.equal(1)
    })

    it("must trigger event given arguments", function() {
      var obj = create()
      var fn = Sinon.spy()
      obj.on("foo", fn)
      obj.trigger("foo", 1, 2, 3)
      fn.callCount.must.equal(1)
      fn.firstCall.args.must.eql([1, 2, 3])
    })

    it("must trigger listeners of Object.prototype's properties", function() {
      var obj = create()
      var fn = Sinon.spy()
      obj.on("hasOwnProperty", fn)
      obj.trigger("hasOwnProperty")
      fn.callCount.must.equal(1)
    })

    it("must trigger inherited listeners for Object.prototype's properties",
      function() {
      var obj = create()
      var hasOwnProperty = Sinon.spy()
      obj.on("hasOwnProperty", hasOwnProperty)

      var child = Object.create(obj)
      var toString = Sinon.spy()
      child.on("toString", toString)

      child.trigger("hasOwnProperty")
      hasOwnProperty.callCount.must.equal(1)
      child.trigger("toString")
      toString.callCount.must.equal(1)
    })

    it("must not trigger if event name only in Object.prototype", function() {
      var obj = create()
      obj.on("foo", function() {}) // Let this._events be created.
      obj.trigger("hasOwnProperty")
    })

    it("must be renameable", function() {
      var obj = create()
      obj.emit = obj.trigger

      var fn = Sinon.spy()
      obj.on("foo", fn)
      obj.emit("foo")
      fn.callCount.must.equal(1)
    })
  })
})
