'use strict';

const isInstanceOf = require('core-functions/objects').isInstanceOf;

const rccCore = require('rcc-core');

const redis = require('redis');
const ReplyError = redis.ReplyError;
exports.ReplyError = ReplyError;

const adaptee = 'redis';
exports.adaptee = adaptee;

const defaultHost = '127.0.0.1';
const defaultPort = rccCore.DEFAULT_REDIS_PORT;

exports.defaultHost = defaultHost;
exports.defaultPort = defaultPort;

exports.createClient = createClient;

exports.getClientFunction = getClientFunction;
exports.setClientFunction = setClientFunction;
exports.deleteClientFunction = deleteClientFunction;

exports.isMovedError = isMovedError;
exports.resolveHostAndPortFromMovedError = resolveHostAndPortFromMovedError;

function adaptRedisClient() {
  const prototype = redis.RedisClient.prototype;

  if (!prototype.getAdapter) {
    prototype.getAdapter = getAdapter;
  }

  if (!prototype.getOptions) {
    prototype.getOptions = getOptions;
  }

  if (!prototype.isClosing) {
    prototype.isClosing = isClosing;
  }

  if (!prototype.resolveHostAndPort) {
    prototype.resolveHostAndPort = resolveHostAndPort;
  }

  if (!prototype.addEventListeners) {
    prototype.addEventListeners = addEventListeners;
  }

  if (!prototype.getFunction) {
    prototype.getFunction = getClientFunction;
  }

  if (!prototype.setFunction) {
    prototype.setFunction = setClientFunction;
  }

  if (!prototype.deleteFunction) {
    prototype.deleteFunction = deleteClientFunction;
  }
}

adaptRedisClient();

/**
 * Creates a new RedisClient instance.
 * @param {RedisClientOptions|undefined} [redisClientOptions] - the options to use to construct the new RedisClient
 *        instance
 * @return {RedisClient} returns the new RedisClient instance
 */
function createClient(redisClientOptions) {
  return redis.createClient(redisClientOptions);
}

function getClientFunction(fnName) {
  return redis.RedisClient.prototype[fnName];
}

function setClientFunction(fnName, fn) {
  redis.RedisClient.prototype[fnName] = fn;
}

function deleteClientFunction(fnName) {
  delete redis.RedisClient.prototype[fnName];
}

/**
 * Returns true if the given error indicates that the key attempted was moved to a new host and port; otherwise returns
 * false.
 * @param {Error|ReplyError} error - an error thrown by a RedisClient instance
 * @return {boolean} true if moved; false otherwise
 */
function isMovedError(error) {
  // Check if error message contains something like: "MOVED 14190 127.0.0.1:6379"
  return !!isInstanceOf(error, ReplyError) && error.code === 'MOVED';
}

/**
 * Extracts the new host and port from the given RedisClient "moved" ReplyError.
 * @param {ReplyError|Error} movedError - a ReplyError thrown by a RedisClient instance that indicates the redis server
 *        has moved
 * @return {[string, number|string]} the new host and port
 */
function resolveHostAndPortFromMovedError(movedError) {
  // Attempt to resolve the new host & port from the error message
  if (isMovedError(movedError)) {
    return movedError.message.substring(movedError.message.lastIndexOf(' ') + 1).split(':');
  }
  throw new Error(`Unexpected redis client "moved" ReplyError - ${movedError}`);
}

// /**
//  * Returns true if the given error indicates that the client must ASK a new host and port for a key's value;
//  * otherwise returns false.
//  * @param {Error|ReplyError} error - an error thrown by a RedisClient instance
//  * @return {boolean} true if moved; false otherwise
//  */
// function isAskError(error) {
//   // Check if error message contains something like: "ASK 14190 127.0.0.1:6379" //TODO check if ASK looks like this
//   return !!isInstanceOf(error, ReplyError) && error.code === 'ASK';

/**
 * Returns true if this RedisClient instance's connection is closing or has closed.
 * @return {boolean} true if closing or closed; false otherwise
 */
function getAdapter() {
  return module.exports;
}

/**
 * Returns the options with which this RedisClient instance was constructed.
 * @returns {RedisClientOptions} the options used
 */
function getOptions() {
  return this._options;
}

/**
 * Returns true if this RedisClient instance's connection is closing or has closed.
 * @return {boolean} true if closing or closed; false otherwise
 */
function isClosing() {
  return this.closing;
}

/**
 * Resolves the host & port of this RedisClient instance.
 * @return {[string, string|number]} an array containing the host and port
 */
function resolveHostAndPort() {
  const connectionOptions = this.connection_options;
  return connectionOptions ? [connectionOptions.host, connectionOptions.port] :
    this.options ? [this.options.host, this.options.port] : [defaultHost, defaultPort];
}

function addEventListeners(onConnect, onReady, onReconnecting, onError, onClientError, onEnd, onClose) {
  if (typeof onConnect === 'function') this.on('connect', onConnect);
  if (typeof onReady === 'function') this.on('ready', onReady);
  if (typeof onReconnecting === 'function') this.on('reconnecting', onReconnecting);
  if (typeof onError === 'function') this.on('error', onError);
  if (typeof onClientError === 'function') this.on('clientError', onClientError);
  if (typeof onEnd === 'function') this.on('end', onEnd);
  if (typeof onClose === 'function') this.on('close', onClose);
}