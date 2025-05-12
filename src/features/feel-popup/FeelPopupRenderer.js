import { render } from 'preact';
import { FeelPopup } from './components';
import { query as domQuery } from 'min-dom';
import { isString } from 'min-dash';

export class FeelPopupRenderer {
  constructor(eventBus) {
    this._eventBus = eventBus;

    this._container = null;
    this._element = null;

    eventBus.on('propertiesPanelPopup.open', (context) => {
      this._renderPopup(context);
    });

    eventBus.on('propertiesPanelPopup.close', () => {
      this._removePopup();
    });
  }

  _renderPopup(context) {
    let { container, props } = context;

    container = this._container = getContainer(container) || document.body;

    const element = this._element = createElement();

    container.appendChild(element);

    // TODO(philippfromme): there is no useService in this context, so we need
    // to pass the event bus as a prop or create a context provider, however,
    // a custom renderer would have to use that context provider as well to have
    // access to the event bus and other services
    // TODO(philippfromme): there is no guarantee that a custom renderer will
    // fire any events that we rely on in https://github.com/camunda/camunda-modeler/blob/develop/client/src/app/tabs/bpmn/modeler/features/properties-panel-keyboard-bindings/FeelPopupKeyboardBindings.js
    render(
      <FeelPopup { ...props } eventBus={ this._eventBus } />,
      element
    );
  }

  _removePopup() {
    if (!this._container) {
      return;
    }

    render(null, this._element);

    this._container.removeChild(this._element);

    this._container = null;
  }
}

FeelPopupRenderer.$inject = [ 'eventBus' ];

// helpers /////////////////

function createElement() {
  const element = document.createElement('div');

  element.classList.add('bio-properties-panel-popup-container');

  return element;
}

function getContainer(container) {
  if (isString(container)) {
    return domQuery(container);
  }

  return container;
}