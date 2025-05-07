import { calculatePopupPosition, getPopupTitle } from './components/helpers';

export class FeelPopup {
  constructor(eventBus) {
    this._eventBus = eventBus;
    this._activePopupEntryId = null;

    this._init();
  }

  _init() {
    this._eventBus.on('propertiesPanel.expandEntry', (expandEntryEvent) => {
      this.openPopup(expandEntryEvent);
    });

    this._eventBus.on('propertiesPanel.unmountedEntry', ({ entryId }) => {
      if (this._activePopupEntryId === entryId) {
        this.closePopup(entryId);
      }
    });

    this._eventBus.on('propertiesPanel.detach', () => {
      if (this._activePopupEntryId) {
        this.closePopup(this._activePopupEntryId);
      }
    });
  }

  openPopup(expandEntryEvent) {
    const { entryId } = expandEntryEvent;
    const openPopupEvent = {
      entryId,
      context: _getPopupOpenContext(
        this._eventBus,
        (entryId) => this.closePopup(entryId),
        expandEntryEvent
      ),
    };

    if (this._activePopupEntryId === entryId) {
      this._eventBus.fire('propertiesPanelPopup.update', openPopupEvent);
      return;
    }

    if (this._activePopupEntryId) {
      this.closePopup(this._activePopupEntryId);
    }

    this._activePopupEntryId = entryId;

    this._eventBus.fire('propertiesPanelPopup.open', openPopupEvent);
    this._eventBus.fire('propertiesPanel.setExpandedEntries', {
      expandedEntries: [ entryId ],
    });
  }

  closePopup(entryId = null) {
    if (!this._activePopupEntryId) {
      console.warn('No active popup to close.');
      return;
    }

    if (entryId && this._activePopupEntryId !== entryId) {
      console.warn(`Popup with entryId "${entryId}" is not active.`);
      return;
    }

    this._eventBus.fire('propertiesPanelPopup.close', {
      entryId: this._activePopupEntryId,
    });
    this._eventBus.fire('propertiesPanel.setExpandedEntries', {
      expandedEntries: [],
    });

    this._activePopupEntryId = null;
  }

  getActivePopupEntryId() {
    return this._activePopupEntryId;
  }
}

FeelPopup.$inject = [ 'eventBus' ];

// helpers /////////////////

/**
 * Prepares the context for the popup.
 *
 * @param {Object} expansionEvent
 * @returns {import('./components/FeelPopup').FeelPopupProps}
 */
const _getPopupOpenContext = (eventBus, closePopup, expandEntryEvent) => {
  const { entryId, context } = expandEntryEvent;
  const {
    type,
    value,
    variables,
    onInput,
    hostLanguage,
    singleLine,
    element,
    label,
    tooltipContainer,
    sourceField,
    sourceFieldContainer,
    ...expansionContextProps
  } = context;
  const { popupContainer, getLinks } = expansionContextProps;

  return {
    entryId,
    type,
    title: getPopupTitle({ element, label }),
    value,
    variables,
    onInput,
    onClose: () => {
      closePopup(entryId);

      // setTimeout to ensure the focus happens after the DOM updates make it focusable
      setTimeout(() => {
        sourceField && sourceField.focus();
      }, 0);
    },
    links: getLinks(type),
    position: calculatePopupPosition({ sourceFieldContainer }),
    hostLanguage,
    singleLine,
    element,
    tooltipContainer,
    popupContainer,
    eventBus,
  };
};
