import { render } from 'preact';
import { FeelPopup } from './components';
import { query as domQuery } from 'min-dom';
import { isString } from 'min-dash';

export class FeelPopupRenderer {
  constructor(eventBus) {
    this._eventBus = eventBus;
    this._container = null;

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

    render(
      <FeelPopup { ...props } />,
      container
    );
  }

  _removePopup() {
    if (!this._container) {
      return;
    }

    render(null, this._container);

    this._container = null;
  }
}

FeelPopupRenderer.$inject = [ 'eventBus' ];

// helpers /////////////////

function getContainer(container) {
  if (isString(container)) {
    return domQuery(container);
  }

  return container;
}