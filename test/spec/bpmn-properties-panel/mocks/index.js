class Canvas {
  getRootElement() {}
}

export class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, priority, callback) {
    if (!callback) {
      callback = priority;
    }

    if (!this.listeners[ event ]) {
      this.listeners[ event ] = [];
    }

    this.listeners[ event ].push(callback);
  }

  off() {}

  fire(event, context) {
    if (this.listeners[ event ]) {
      this.listeners[ event ].forEach(callback => callback(context));
    }
  }
}

export class Injector {

  constructor(options = {}) {
    this._options = options;
  }

  get(type) {
    if (type === 'eventBus') {
      return this._options.eventBus || new EventBus();
    }

    if (type === 'canvas') {
      return new Canvas();
    }
  }
}

export function getProviders() {
  return [{
    getGroups: () => (groups) => groups
  }];
}