# rcc-redis-adapter v1.0.0
Wraps and adapts the 'redis' module &amp; its RedisClient instances to be used with the 'redis-client-cache' module

Main module:
- rcc-redis-adapter.js

This module is exported as a [Node.js](https://nodejs.org) module.

## Installation

Using npm:
```bash
$ npm i --save rcc-redis-adapter
```

## Usage

* To use the `rcc-redis-adapter` module
```js
// Get the redis adapter
const redis = require('rcc-redis-adapter');
assert(redis);

// Create a redis client using the redis adapter
const redisClientOptions = {host: '127.0.0.1', port: 6379, string_number: true};
const redisClient = redis.createClient(redisClientOptions);
assert(redisClient);

// Get the host & port of the redis client
const [host, port] = redisClient.resolveHostAndPort();
assert(host === '127.0.0.1');
assert(port === 6379);

// Check if the redis client is closing or not
const closing = redisClient.isClosing();
assert(!closing);

// Set and get a value for a key using the underlying `redis` module's `RedisClient` instance's methods
redisClient.set('KEY', 'VALUE', (err, res) => {
  if (!err) {
    console.log(res);
    redisClient.get('KEY', (err, value) => {
      if (!err) {
        assert(value === 'VALUE');
      }
    });
  }
})
```

## Unit tests
This module's unit tests were developed with and must be run with [tape](https://www.npmjs.com/package/tape). The unit tests have been tested on [Node.js v6.10.3](https://nodejs.org/en/blog/release/v6.10.3).  

See the [package source](https://github.com/byron-dupreez/rcc-redis-adapter) for more details.

## Changes
See [release_notes.md](./release_notes.md