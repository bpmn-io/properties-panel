import { getPopupPosition, getPopupTitle } from './components/helpers';

/**
 * FEEL popup component, built as a singleton.
 *
 * In order to implement a custom replacement, handle the following events:
 * - `propertiesPanel.openPopup`
 * - `propertiesPanel.closePopup`
 * - `propertiesPanel.detach`
 *
 * Within the custom renderer, make sure to emit the following events:
 *  - `feelPopup.open` - fired before the popup is mounted
 *  - `feelPopup.opened` - fired after the popup is mounted. Event context contains the DOM node of the popup as `domNode`
 *  - `feelPopup.close` - fired before the popup is unmounted. Event context contains the DOM node of the popup as `domNode`
 *  - `feelPopup.closed` - fired after the popup is unmounted
 */
export class FeelPopup {
  constructor(eventBus, config = {}) {
    this._eventBus = eventBus;
    this._config = config;

    this._isOpen = false;

    eventBus.on('propertiesPanel.openPopup', (_, context) => {
      this.open(context.entryId, context, context.sourceElement);

      // return true to indicate that popup was opened
      return true;
    });

    eventBus.on([
      'propertiesPanel.closePopup',
      'propertiesPanel.detach'
    ], () => {
      this.close();
    });
  }

  /**
   * Check if the FEEL popup is open.
   * @return {Boolean}
   */
  isOpen() {
    return this._isOpen;
  }

  /**
   * Open the FEEL popup.
   *
   * @param {String} entryId
   * @param {Object} popupConfig
   * @param {HTMLElement} sourceElement
   */
  open(entryId, popupConfig, sourceElement) {

    // close before opening a new one
    this.close();

    this._openPopup({
      ...popupConfig,
      entryId,
      sourceElement
    });
  }

  /**
   * Close the FEEL popup.
   */
  close() {
    this._closePopup();
  }

  _openPopup(context) {
    const {
      element,
      label,
      sourceElement,
      type
    } = context;

    this._isOpen = true;

    this._eventBus.fire('propertiesPanelPopup.open', {
      container: this._config.feelPopupContainer,
      config: {
        ...context,
        links: this._config.getFeelPopupLinks?.(type) || [],
        onClose: () => {
          this._closePopup();

          // setTimeout to ensure the focus happens after the DOM updates make it focusable
          setTimeout(() => {
            sourceElement && sourceElement.focus();
          }, 0);
        },
        position: getPopupPosition(),
        title: getPopupTitle({ element, label })
      }
    });
  }

  _closePopup() {
    if (this._isOpen) {
      this._isOpen = false;

      this._eventBus.fire('propertiesPanelPopup.close');
    }
  }
}

FeelPopup.$inject = [ 'eventBus', 'config.propertiesPanel' ];
