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
    let { container, config } = context;

    container = this._container = getContainer(container) || document.body;

    const element = this._element = createElement();

    container.appendChild(element);

    // TODO(philippfromme): there is no useService in this context, so we need
    // to pass the event bus as a prop or create a context provider, however,
    // a custom renderer would have to use that context provider as well to have
    // access to the event bus and other services
    this._emit('feelPopup.open');

    render(
      <FeelPopup { ...config } eventBus={ this._eventBus } />,
      element
    );

    this._emit('feelPopup.opened', {
      domNode: element
    });
  }

  _removePopup() {
    if (!this._container) {
      return;
    }

    this._emit('feelPopup.close', {
      domNode: this._element
    });

    render(null, this._element);

    this._container.removeChild(this._element);

    this._container = null;

    this._emit('feelPopup.closed');
  }

  _emit(event, context) {
    this._eventBus.fire(event, context);
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