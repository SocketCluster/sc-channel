const AsyncIterableStream = require('async-iterable-stream');

class SCChannel {
  constructor(name, client, eventStream, dataStream) {
    this.PENDING = 'pending';
    this.SUBSCRIBED = 'subscribed';
    this.UNSUBSCRIBED = 'unsubscribed';

    this.name = name;
    this.client = client;

    this._eventStream = eventStream;
    this._dataStream = dataStream;
  }

  async *createEventStream(stream, eventName) {
    for await (let packet of stream) {
      if (packet.event === eventName) {
        if (packet.end) {
          return;
        }
        yield packet.data;
      }
    }
  }

  listener(eventName) {
    return new AsyncIterableStream(() => {
      return this.createEventStream(this._eventStream, eventName);
    });
  }

  endListener(eventName) {
    this._eventStream.write({
      event: eventName,
      end: true
    });
  }

  emit(eventName, data) {
    var listener = this.listeners[eventName];
    if (listener) {
      listener.write(data);
    }
  }

  get state() {
    return this.client.getChannelState(this.name);
  }

  set state(value) {
    throw new Error('Cannot directly set channel state');
  }

  get options() {
    return this.client.getChannelOptions(this.name);
  }

  set options(value) {
    throw new Error('Cannot directly set channel options');
  }

  subscribe(options) {
    this.client.subscribe(this.name, options);
  }

  unsubscribe() {
    this.client.unsubscribe(this.name);
  }

  isSubscribed(includePending) {
    return this.client.isSubscribed(this.name, includePending);
  }

  publish(data, callback) {
    this.client.publish(this.name, data, callback);
  }

  async once() {
    return this._dataStream.once();
  }

  [Symbol.asyncIterator]() {
    return this._dataStream;
  }
}

module.exports.SCChannel = SCChannel;
