export class FeelPopupManager {
  constructor(eventBus) {
    this._eventBus = eventBus;
    this._activePopupEntryId = null;

    this._init();
  }

  _init() {
    this._eventBus.on('propertiesPanel.expandEntry', ({ entryId, entryElement, context }) => {
      this.openPopup(entryId, entryElement, context);
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

  openPopup(entryId, entryElement, context) {
    if (this._activePopupEntryId === entryId) {
      this._eventBus.fire('propertiesPanelPopup.update', { entryId, entryElement, context });
      return;
    }

    if (this._activePopupEntryId) {
      this.closePopup(this._activePopupEntryId);
    }

    this._activePopupEntryId = entryId;

    this._eventBus.fire('propertiesPanelPopup.open', { entryId, entryElement, context });
    this._eventBus.fire('propertiesPanel.setExpandedEntries', {
      expandedEntries: [ entryId ]
    });
  }

  closePopup(entryId) {
    if (this._activePopupEntryId !== entryId) {
      console.warn(`Popup with entryId "${entryId}" is not active.`);
      return;
    }

    this._activePopupEntryId = null;

    this._eventBus.fire('propertiesPanelPopup.close', { entryId });
    this._eventBus.fire('propertiesPanel.setExpandedEntries', {
      expandedEntries: []
    });
  }

  getActivePopupEntryId() {
    return this._activePopupEntryId;
  }
}

FeelPopupManager.$inject = [ 'eventBus' ];