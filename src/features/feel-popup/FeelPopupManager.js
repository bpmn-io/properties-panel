export class FeelPopupManager {
  constructor(eventBus) {
    this._eventBus = eventBus;
    this._activePopupEntryId = null;

    this._init();
  }

  _init() {
    this._eventBus.on('propertiesPanel.openPopup', ({ entryId, entryElement, context }) => {
      this.openPopup(entryId, entryElement, context);
    });

    this._eventBus.on('propertiesPanel.closePopup', ({ entryId }) => {
      this.closePopup(entryId);
    });

    this._eventBus.on('propertiesPanel.detach', () => {
      if (this._activePopupEntryId) {
        this.closePopup(this._activePopupEntryId);
      }
    });
  }

  openPopup(entryId, entryElement, context) {
    if (this._activePopupEntryId === entryId) {
      this._eventBus.fire('propertiesPanel.popup.update', { entryId, entryElement, context });
      return;
    }

    if (this._activePopupEntryId) {
      this.closePopup(this._activePopupEntryId);
    }

    this._activePopupEntryId = entryId;

    this._eventBus.fire('propertiesPanel.popup.open', { entryId, entryElement, context });
    this._eventBus.fire('propertiesPanel.setActivePopupEntryIds', {
      activePopupEntryIds: [ entryId ]
    });
  }

  closePopup(entryId) {
    if (this._activePopupEntryId !== entryId) {
      console.warn(`Popup with entryId "${entryId}" is not the active propertiesPanel.popup.`);
      return;
    }

    this._activePopupEntryId = null;

    this._eventBus.fire('propertiesPanel.popup.close', { entryId });
    this._eventBus.fire('propertiesPanel.setActivePopupEntryIds', {
      activePopupEntryIds: []
    });
  }

  getActivePopupEntryId() {
    return this._activePopupEntryId;
  }
}

FeelPopupManager.$inject = [ 'eventBus' ];