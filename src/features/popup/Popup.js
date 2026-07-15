import { getPopupPosition, getPopupTitle } from './components/helpers';
import { FeelPopup, TextPopup } from './components';

const DEFAULT_POPUP_TYPE = 'text';

/**
 * Popup manager, built as a singleton. Renders the registered provider for a
 * given popup type; consumers may plug in their own via #registerProvider.
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
export class Popup {
  constructor(eventBus, config = {}) {
    this._eventBus = eventBus;
    this._config = config;

    this._isOpen = false;
    this._providers = {};

    // built-in providers; consumers may register their own via #registerProvider
    this.registerProvider('feel', FeelPopup);
    this.registerProvider('feelers', FeelPopup);
    this.registerProvider('text', TextPopup);

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
   * Register a popup provider (component) for a given type.
   *
   * @param {string} type
   * @param {Function|import('preact').Component} component
   */
  registerProvider(type, component) {
    this._providers[type] = component;
  }

  /**
   * Get the popup provider for a type, falling back to the default provider.
   *
   * @param {string} type
   * @return {Function|import('preact').Component}
   */
  getProvider(type) {
    return this._providers[type] || this._providers[DEFAULT_POPUP_TYPE];
  }

  /**
   * Check if the popup is open.
   * @return {Boolean}
   */
  isOpen() {
    return this._isOpen;
  }

  /**
   * Open the popup.
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
   * Close the popup.
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
        component: this.getProvider(type),
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

Popup.$inject = [ 'eventBus', 'config.propertiesPanel' ];
