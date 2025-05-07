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