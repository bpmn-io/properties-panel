import { getPopupPosition, getPopupTitle } from './components/helpers';
import { FeelPlaygroundPopup, FeelPopup, TextPopup } from './components';

const DEFAULT_POPUP_TYPE = 'text';

// consumers registering via #registerProvider default to DEFAULT_PRIORITY,
// so their providers take precedence over the LOW_PRIORITY built-ins.
const DEFAULT_PRIORITY = 1000;
const LOW_PRIORITY = 500;

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

    // built-in providers, registered at LOW_PRIORITY so consumers can
    // override them via #registerProvider using the default priority
    this.registerProvider('feel', LOW_PRIORITY, FeelPlaygroundPopup);
    this.registerProvider('feel-playground', LOW_PRIORITY, FeelPlaygroundPopup);
    this.registerProvider('feelers', LOW_PRIORITY, FeelPopup);
    this.registerProvider('text', LOW_PRIORITY, TextPopup);

    eventBus.on('propertiesPanel.openPopup', (_, context) => {
      return this.open(context.entryId, context, context.sourceElement);
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
   * A higher `priority` wins when multiple providers are registered for the
   * same type; the built-in providers use a low priority so consumers override
   * them by default.
   *
   * @param {string} type
   * @param {number} [priority=DEFAULT_PRIORITY]
   * @param {Function|import('preact').Component} provider
   */
  registerProvider(type, priority, provider) {
    if (!provider) {
      provider = priority;
      priority = DEFAULT_PRIORITY;
    }

    this._eventBus.on('propertiesPanelPopup.getProviders.' + type, priority, function(event) {
      event.providers.push(provider);
    });
  }

  /**
   * Get the popup providers registered for a type.
   *
   * @param {string} type
   * @return {Array<Function|import('preact').Component>}
   */
  _getProviders(type) {
    const event = this._eventBus.createEvent({
      type: 'propertiesPanelPopup.getProviders.' + type,
      providers: []
    });

    this._eventBus.fire(event);

    return event.providers;
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

    return this._openPopup({
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

  /**
   * Update the open popup configuration.
   *
   * @param {Object} popupConfig
   */
  update(popupConfig) {
    if (!this._isOpen) {
      return;
    }

    this._eventBus.fire('propertiesPanelPopup.update', {
      config: popupConfig
    });
  }

  _openPopup(context) {
    const {
      element,
      label,
      sourceElement,
      type = DEFAULT_POPUP_TYPE
    } = context;

    const component = this._getProviders(type)[0];

    if (!component) {
      return false;
    }

    this._isOpen = true;

    this._eventBus.fire('propertiesPanelPopup.open', {
      container: this._config.feelPopupContainer,
      config: {
        ...this._config.feelPlayground,
        ...context,
        component,
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

    return true;
  }

  _closePopup() {
    if (this._isOpen) {
      this._isOpen = false;

      this._eventBus.fire('propertiesPanelPopup.close');
    }
  }
}

Popup.$inject = [ 'eventBus', 'config.propertiesPanel' ];
