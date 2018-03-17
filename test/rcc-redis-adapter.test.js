'use strict';

const test = require('tape');

// Get the redis adapter
const redis = require('../rcc-redis-adapter');

const host0 = '127.0.0.1';
const port0 = 6379;

const host1 = 'localhost';
const port1 = 9999;

function addEventListeners(redisClient, desc, customOnError) {
  const [host, port] = redisClient.resolveHostAndPort();

  const onConnect = () => {
    console.log(`*** Redis client ${desc} connection to host (${host}) & port (${port}) has CONNECTED - took ${Date.now() - startMs} ms`);
  };

  const onReady = () => {
    console.log(`*** Redis client ${desc} connection to host (${host}) & port (${port}) is READY - took ${Date.now() - startMs} ms`);
  };

  const onReconnecting = () => {
    console.log(`*** Redis client ${desc} connection to host (${host}) & port (${port}) is RECONNECTING`);
  };

  const onError = err => {
    console.log(`*** Redis client ${desc} connection to host (${host}) & port (${port}) hit error ${err}`);
    if (customOnError) {
      return customOnError(err);
    }
    console.error(err);
    redisClient.end(true, () => {});
  };

  const onClientError = err => {
    console.log(`*** Redis client ${desc} connection to host (${host}) & port (${port}) hit client error ${err}`);
    console.error(err);
  };

  const onEnd = () => {
    console.log(`*** Redis client ${desc} connection to host (${host}) & port (${port}) has CLOSED`);
  };

  redisClient.addEventListeners(onConnect, onReady, onReconnecting, onError, onClientError, onEnd);
}

test('createClient', t => {
  // Create a redis client using the redis adapter
  const redisClient0 = redis.createClient();
  t.ok(redisClient0, `redisClient0 must exist`);
  t.notOk(redisClient0.isClosing(), `redisClient0 should not be closing yet`);

  let [h, p] = redisClient0.resolveHostAndPort();
  t.equal(h, host0, `redisClient0 host must be ${host0}`);
  t.equal(p, port0, `redisClient0 port must be ${port0}`);

  addEventListeners(redisClient0, 0, err => {
    t.pass(`Expected and got an error from redisClient0 (${err})`);
    redisClient0.end(true, () => {});
    t.ok(redisClient0.isClosing(), `redisClient0 should be closing now`);
  });

  const redisClient1 = redis.createClient({port: port0, host: host0});
  t.ok(redisClient1, `redisClient1 must exist`);
  t.notOk(redisClient1.isClosing(), `redisClient1 should not be closing yet`);

  [h, p] = redisClient1.resolveHostAndPort();
  t.equal(h, host0, `redisClient1 host must be ${host0}`);
  t.equal(p, port0, `redisClient1 port must be ${port0}`);

  addEventListeners(redisClient1, 1, err => {
    t.pass(`Expected and got an error from redisClient1 (${err})`);
    redisClient1.end(true, () => {});
    t.ok(redisClient1.isClosing(), `redisClient1 should be closing now`);
  });

  const redisClientOptions2 = {host: host1, port: port1, string_number: true};
  const redisClient2 = redis.createClient(redisClientOptions2);

  t.ok(redisClient2, `redisClient2 must exist`);
  t.notOk(redisClient2.isClosing(), `redisClient2 should not be closing yet`);

  [h, p] = redisClient2.resolveHostAndPort();
  t.equal(h, host1, `redisClient2 host must be ${host1}`);
  t.equal(p, port1, `redisClient2 port must be ${port1}`);

  // Set and get a value for a key using the underlying `redis` module's `RedisClient` instance's methods
  const key = 'KEY';
  const expectedValue = 'VALUE';

  addEventListeners(redisClient2, 2, err => {
    t.pass(`Expected and got an error from redisClient2 (${err})`);
    redisClient2.end(true, () => {});
    t.ok(redisClient2.isClosing(), `redisClient2 should be closing now`);
  });

  redisClient2.set(key, expectedValue, (err,) => {
    if (err) {
      t.pass(`Expected and got a set error (${err})`);
      redisClient0.end(true);
      redisClient1.end(true);
      redisClient2.end(true);
      t.ok(redisClient0.isClosing(), `redisClient0 should be closing/closed`);
      t.ok(redisClient1.isClosing(), `redisClient1 should be closing/closed`);
      t.ok(redisClient2.isClosing(), `redisClient2 should be closing/closed`);
      t.end();
    } else {
      // console.log(res);
      redisClient2.get(key, (err, value) => {
        if (err) {
          t.pass(`Expected and got a get error (${err})`);
        } else {
          t.equal(value, 'VALUE', `value must be '${expectedValue}'`);
        }
        redisClient0.end(true);
        redisClient1.end(true);
        redisClient2.end(true);
        t.ok(redisClient0.isClosing(), `redisClient0 should be closing/closed`);
        t.ok(redisClient1.isClosing(), `redisClient1 should be closing/closed`);
        t.ok(redisClient2.isClosing(), `redisClient2 should be closing/closed`);
        t.end();
      });
    }
  });
});
