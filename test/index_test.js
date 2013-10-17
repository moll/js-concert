var _ = require("underscore")
var Sinon = require("sinon")
var Concert = require("..")

describe("Concert", function() {
  function create() { return _.extend({}, Concert) }

  it("must only have public API as enumerable properties", function() {
    Concert.must.have.keys(["on", "once", "off", "trigger"])
  })

  describe(".on", function() {
    describe("given nothing", function() {
      it("must not bind", function() {
        var obj = create()
        obj.on()
        obj.must.not.have.property("_events")
      })

      it("must return self", function() {
        var obj = create()
        obj.on().must.equal(obj)
      })
    })

    describe("given only name", function() {
      it("must not bind", function() {
        var obj = create()
        obj.on("foo")
        obj.must.not.have.property("_events")
      })

      it("must return self", function() {
        var obj = create()
        obj.on("foo").must.equal(obj)
      })
    })

    describe("given name and function", function() {
      it("must create this._events", function() {
        var obj = create()
        obj.on("foo", function() {})
        obj.must.have.property("_events")
      })

      it("must bind", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn)
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must bind to the obj's context", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn)
        obj.trigger("foo")
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

      it("must not bind given null name", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on(null, fn)
        obj.trigger("null")
        fn.callCount.must.equal(0)
      })

      it("must not bind given undefined name", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on(undefined, fn)
        obj.trigger("undefined")
        fn.callCount.must.equal(0)
      })

      it("must bind given 0 name", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on(0, fn)
        obj.trigger("0")
        fn.callCount.must.equal(1)
      })

      it("must return self", function() {
        var obj = create()
        obj.on("foo", function() {}).must.equal(obj)
      })
    })

    describe("given name, function and context", function() {
      it("must bind event", function() {
        var obj = create()
        var context = {}
        var fn = Sinon.spy()
        obj.on("foo", fn, context)
        obj.trigger("foo")
        fn.firstCall.thisValue.must.equal(context)
      })
    })
  })

  describe(".once", function() {
    describe("given only name", function() {
      it("must not affect other events", function() {
        var obj = create()
        var other = Sinon.spy()
        obj.once("foo")
        obj.on("foo", other)
        obj.trigger("foo")
        obj.trigger("foo")
        other.callCount.must.equal(2)
      })

      it("must return self", function() {
        var obj = create()
        obj.once("foo").must.equal(obj)
      })
    })

    describe("given name and function", function() {
      it("must create this._events", function() {
        var obj = create()
        obj.once("foo", function() {})
        obj.must.have.property("_events")
      })

      it("must not allow calling the event twice", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.once("foo", fn)
        obj.trigger("foo")
        obj.trigger("foo")
        fn.callCount.must.equal(1)
      })

      it("must bind", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.once("foo", fn)
        obj.trigger("foo")
        fn.callCount.must.equal(1)
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

      it("must bind to the obj's context", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.once("foo", fn)
        obj.trigger("foo")
        fn.firstCall.thisValue.must.equal(obj)
      })
    
      it("must return self", function() {
        var obj = create()
        obj.once("foo", function() {}).must.equal(obj)
      })
    })

    describe("given name, function and context", function() {
      it("must bind event", function() {
        var obj = create()
        var context = {}
        var fn = Sinon.spy()
        obj.once("foo", fn, context)
        obj.trigger("foo")
        fn.firstCall.thisValue.must.equal(context)
      })
    })
  })

  describe(".off", function() {
    describe("given nothing", function() {
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

      it("must delete this._events", function() {
        var obj = create()
        obj.on("foo", function() {})
        obj.off()
        obj.must.not.have.property("_events")
      })

      it("must return self", function() {
        var obj = create()
        obj.off().must.equal(obj)
      })
    })

    describe("given name", function() {
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

      it("must return self", function() {
        var obj = create()
        obj.off("foo").must.equal(obj)
      })
    })

    describe("given name and function", function() {
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

      it("must return self", function() {
        var obj = create()
        obj.off("foo", function() {}).must.equal(obj)
      })
    })

    describe("given function", function() {
      it("must unbind undefined context if given null", function() {
        var obj = create()
        var context = {}
        var fn = Sinon.spy()
        obj.on("foo", fn, undefined)
        obj.off(null, fn, null)
        obj.trigger("foo")
        fn.callCount.must.equal(0)
      })

      it("must unbind null context if given undefined", function() {
        var obj = create()
        var context = {}
        var fn = Sinon.spy()
        obj.on("foo", fn, null)
        obj.off(null, fn, undefined)
        obj.trigger("foo")
        fn.callCount.must.equal(0)
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
    })

    describe("given name, function and context", function() {
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

      it("must return self", function() {
        var obj = create()
        obj.off("foo", function() {}, {}).must.equal(obj)
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
  })

  describe(".trigger", function() {
    describe("given name", function() {
      it("must trigger event", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn)
        obj.trigger("foo")
        fn.callCount.must.equal(1)
        fn.firstCall.args.must.be.empty()
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

      it("must return self even if this._events doesn't exist", function() {
        var obj = create()
        obj.trigger("foo").must.equal(obj)
      })

      it("must return self if no matching event", function() {
        var obj = create()
        obj.on("bar", function() {})
        obj.trigger("foo").must.equal(obj)
      })

      it("must trigger \"all\" event with event name", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("all", fn)
        obj.trigger("foo")
        fn.callCount.must.equal(1)
        fn.firstCall.args.must.eql(["foo"])
      })
    })

    describe("given name and arguments", function() {
      it("must trigger event", function() {
        var obj = create()
        var fn = Sinon.spy()
        obj.on("foo", fn)
        obj.trigger("foo", 1, 2, 3)
        fn.callCount.must.equal(1)
        fn.firstCall.args.must.eql([1, 2, 3])
      })
    })
  })
})
