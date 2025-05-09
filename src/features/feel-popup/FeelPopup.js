import { getPopupPosition, getPopupTitle } from './components/helpers';

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

    eventBus.on('propertiesPanel.closePopup', () => {
      this._closePopup();
    });

    eventBus.on('propertiesPanel.detach', () => {
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
}

FeelPopup.$inject = [ 'eventBus', 'config.propertiesPanel' ];
