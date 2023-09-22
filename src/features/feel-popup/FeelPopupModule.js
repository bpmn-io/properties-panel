export default class FeelPopupModule {

  constructor(eventBus) {
    this._eventBus = eventBus;
  }

  /**
   * Check if the FEEL popup is open.
   * @return {Boolean}
   */
  isOpen() {
    return this._eventBus.fire('feelPopup._isOpen');
  }

  /**
   * Open the FEEL popup.
   *
   * @param {String} entryId
   * @param {Object} popupConfig
   * @param {HTMLElement} sourceElement
   */
  open(entryId, popupConfig, sourceElement) {
    return this._eventBus.fire('feelPopup._open', {
      entryId,
      popupConfig,
      sourceElement
    });
  }

  /**
   * Close the FEEL popup.
   */
  close() {
    return this._eventBus.fire('feelPopup._close');
  }
}

FeelPopupModule.$inject = [ 'eventBus' ];