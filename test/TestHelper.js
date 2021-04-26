import {
  attr as domAttr
} from 'min-dom';

import {
  bootstrapBpmnJS,
  insertCSS
} from 'bpmn-js/test/helper';

import Modeler from 'bpmn-js/lib/Modeler';

export * from 'bpmn-js/test/helper';


export function insertCoreStyles() {
  insertCSS(
    'properties-panel.css',
    require('../assets/properties-panel.css').default
  );

  insertCSS(
    'test.css',
    require('./test.css').default
  );
}

export function insertBpmnStyles() {
  insertCSS(
    'diagram.css',
    require('bpmn-js/dist/assets/diagram-js.css').default
  );

  insertCSS(
    'bpmn-font.css',
    require('bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css').default
  );
}

export function bootstrapModeler(diagram, options, locals) {
  return bootstrapBpmnJS(Modeler, diagram, options, locals);
}

/**
 * Triggers a change event
 *
 * @param element on which the change should be triggered
 * @param eventType type of the event (e.g. click, change, ...)
 */
export function triggerEvent(element, eventType) {

  let evt;

  eventType = eventType || 'change';

  if (document.createEvent) {
    try {

      // Chrome, Safari, Firefox
      evt = new MouseEvent((eventType), {
        view: window,
        bubbles: true,
        cancelable: true
      });
    } catch (e) {

      // IE 11, PhantomJS (wat!)
      evt = document.createEvent('MouseEvent');

      evt.initEvent((eventType), true, true);
    }
    return element.dispatchEvent(evt);
  } else {

    // Welcome IE
    evt = document.createEventObject();

    return element.fireEvent('on' + eventType, evt);
  }
}

/**
 * Set the new value to the given element.
 *
 * @param element on which the change should be triggered
 * @param value new value for the element
 * @param eventType (optional) type of the event (e.g. click, change, ...)
 * @param cursorPosition (optional) position ot the cursor after changing
 *                                  the value
 */
export function triggerValue(element, value, eventType, cursorPosition) {
  if (typeof eventType == 'number') {
    cursorPosition = eventType;
    eventType = null;
  }

  element.focus();

  if (domAttr(element, 'contenteditable')) {
    element.innerText = value;
  } else {
    element.value = value;
  }

  if (cursorPosition) {
    element.selectionStart = cursorPosition;
    element.selectionEnd = cursorPosition;
  }

  triggerEvent(element, eventType);
}

export function triggerInput(element, value) {
  element.value = value;

  triggerEvent(element, 'input');

  element.focus();
}

export function triggerKeyEvent(element, event, code) {
  let e = document.createEvent('Events');

  if (e.initEvent) {
    e.initEvent(event, true, true);
  }

  e.keyCode = code;
  e.which = code;

  element.dispatchEvent(e);
}