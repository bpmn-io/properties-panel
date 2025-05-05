import { render } from 'preact';
import { FeelPopup } from './components';
import { query as domQuery } from 'min-dom';

export class FeelPopupRenderer {
  constructor(eventBus) {
    this._eventBus = eventBus;
    this._popups = {};
    this._popupNodes = {};

    this._init();
  }

  _init() {
    this._eventBus.on([ 'propertiesPanelPopup.open', 'propertiesPanelPopup.update' ], ({ entryId, context }) => {
      this._renderPopup(entryId, context);
    });

    this._eventBus.on('propertiesPanelPopup.close', ({ entryId }) => {
      this._removePopup(entryId);
    });
  }

  _renderPopup(entryId, context) {
    const { popupContainer, onClose, ...popupProps } = context;
    const container = _getContainerNode(popupContainer) || document.body;

    let popupNode = this._popupNodes[entryId];
    if (!popupNode) {
      popupNode = document.createElement('div');
      popupNode.classList.add('bio-properties-panel-popup-container');
      container.appendChild(popupNode);
      this._popupNodes[entryId] = popupNode;
    }

    this._popups[entryId] = popupProps;

    render(
      <FeelPopup
        key={ entryId }
        onClose={ onClose }
        { ...popupProps }
      />,
      popupNode
    );
  }

  _removePopup(entryId) {
    const popupNode = this._popupNodes[entryId];
    if (popupNode) {
      render(null, popupNode);
      popupNode.parentNode.removeChild(popupNode);
      delete this._popupNodes[entryId];
      delete this._popups[entryId];
    }
  }

  getPopups() {
    return Object.keys(this._popups);
  }
}

FeelPopupRenderer.$inject = [ 'eventBus' ];

// helpers /////////////////

function _getContainerNode(container) {
  if (typeof container === 'string') {
    return domQuery(container);
  }

  return container;
}