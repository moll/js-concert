Benchmarks
==========

## Concert.prototype.trigger with arguments
Node v0.11.15 with Macbook Pro 2.4GHz Intel Core 2 Duo.
```
Status quo x 499,316 ops/sec ±0.64% (100 runs sampled)
Passing arguments to apply function x 499,115 ops/sec ±0.64% (56 runs sampled)
Converting arguments to an array before applying x 325,692 ops/sec ±1.53% (101 runs sampled)
```
