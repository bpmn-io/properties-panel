import { isInShadowRoot } from './isInShadowRoot';

/**
 * Keep {@link Event.prototype.target} in shadowDom after current [task](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_DOM_API/Microtask_guide/In_depth) finished.
 *
 * Related question: https://stackoverflow.com/questions/63607966/event-target-changed-in-settimeout-in-shadow-dom
 *
 * @example
 *
 * before:
 *
 * element.addEventListener('click', (ev) => { ... })
 *
 * after:
 *
 * element.addEventListener('click', keepEventTarget((ev) => { ... }))
 *
 * @param {function(Event): void} eventListener
 * @return {(function(): void)|*}
 */
export function keepEventTarget(eventListener) {
  return function callback() {
    for (let i = arguments.length; i--;) {
      const arg = arguments[i];

      if (!(arg instanceof Event)) continue;

      /**
       * performance
       *
       * if {@link arg.currentTarget} in shadowRoot, {@link arg.target} should be in shadowRoot too.
       */
      if (!isInShadowRoot(arg.currentTarget || arg.target)) continue;

      arguments[i] = cloneEvent(arg);
    }

    eventListener.apply(this, arguments);
  };
}

function cloneEvent(event) {
  const eventInit = {};

  for (let key in event) {
    const desc = Object.getOwnPropertyDescriptor(event, key);

    if (desc && (!desc.writable || !desc.configurable || !desc.enumerable || desc.get || desc.set)) {
      Object.defineProperty(eventInit, key, desc);
    } else {
      eventInit[key] = event[key];
    }
  }
  Object.setPrototypeOf(eventInit, event);

  return eventInit;
}
