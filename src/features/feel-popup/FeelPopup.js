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

    eventBus.on('propertiesPanel.openPopup', (context) => {
      this._openPopup(context);

      // return true to indicate that popup was opened
      return true;
    });

    eventBus.on([
      'propertiesPanel.closePopup',
      'propertiesPanel.detach'
    ], () => {
      this._closePopup();
    });
  }

  _openPopup(context) {
    const { props } = context;

    const {
      element,
      label,
      sourceField,
      onCollapse,
      type
    } = props;

    this._closePopup();

    this._isOpen = true;
    this._onCollapse = onCollapse;

    this._eventBus.fire('propertiesPanelPopup.open', {
      container: this._config.feelPopupContainer,
      props: {
        ...props,
        links: this._config.getFeelPopupLinks?.(type),
        onClose: () => {
          this._closePopup();

          // setTimeout to ensure the focus happens after the DOM updates make it focusable
          setTimeout(() => {
            sourceField && sourceField.focus();
          }, 0);
        },
        position: getPopupPosition(),
        title: getPopupTitle({ element, label })
      }
    });
  }

  _closePopup() {
    if (this._isOpen) {
      this._onCollapse?.();

      this._isOpen = false;
      this._onCollapse = null;

      this._eventBus.fire('propertiesPanelPopup.close');
    }
  }

  /*
  * @param {String} entryId
  * @param {Object} popupConfig
  * @param {HTMLElement} sourceField
  */
  open(entryId, popupConfig, sourceField) {
    this._openPopup({
      props: {
        ...popupConfig,
        entryId,
        sourceField,
      },
    });
  }

  close() {
    this._closePopup();
  }

  isOpen() {
    return this._isOpen;
  }
}

FeelPopup.$inject = [ 'eventBus', 'config.propertiesPanel' ];
