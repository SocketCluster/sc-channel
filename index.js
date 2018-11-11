var IterableAsyncStream = require('iterable-async-stream');

var SCChannel = function (name, client, options) {
  IterableAsyncStream.call(this);

  this.PENDING = 'pending';
  this.SUBSCRIBED = 'subscribed';
  this.UNSUBSCRIBED = 'unsubscribed';

  this.name = name;
  this.state = this.UNSUBSCRIBED;
  this.client = client;

  this.listeners = {};
  this.options = options || {};
  this.setOptions(this.options);
};

SCChannel.prototype = Object.create(IterableAsyncStream.prototype);

SCChannel.prototype.setOptions = function (options) {
  if (!options) {
    options = {};
  }
  this.waitForAuth = options.waitForAuth || false;
  this.batch = options.batch || false;

  if (options.data !== undefined) {
    this.data = options.data;
  }
};

SCChannel.prototype.listener = function (eventName) {
  var currentListener = this.listeners[eventName];
  if (!currentListener) {
    currentListener = new IterableAsyncStream();
    this.listeners[eventName] = currentListener;
  }
  return currentListener;
};

SCChannel.prototype.destroyListener = function (eventName) {
  delete this.listeners[eventName];
};

SCChannel.prototype.emit = function (event, data) {
  var listener = this.listeners[event];
  if (listener) {
    listener.write(data);
  }
};

SCChannel.prototype.getState = function () {
  return this.state;
};

SCChannel.prototype.subscribe = function (options) {
  this.client.subscribe(this.name, options);
};

SCChannel.prototype.unsubscribe = function () {
  this.client.unsubscribe(this.name);
};

SCChannel.prototype.isSubscribed = function (includePending) {
  return this.client.isSubscribed(this.name, includePending);
};

SCChannel.prototype.publish = function (data, callback) {
  this.client.publish(this.name, data, callback);
};

SCChannel.prototype.destroy = function () {
  this.client.destroyChannel(this.name);
};

module.exports.SCChannel = SCChannel;
