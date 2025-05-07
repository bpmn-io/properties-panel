import { getPopupPosition, getPopupTitle } from './components/helpers';

export class FeelPopup {
  constructor(eventBus, config = {}) {
    this._eventBus = eventBus;
    this._config = config;

    this._entryId = null;

    eventBus.on('propertiesPanel.expandEntry', (context) => {
      this._openPopup(context);

      // return true to indicate that entry is expanded
      return true;
    });

    eventBus.on('propertiesPanel.unmountedEntry', ({ entryId }) => {
      if (this._entryId === entryId) {
        this._closePopup();
      }
    });

    eventBus.on('propertiesPanel.detach', () => {
      if (this._entryId) {
        this._closePopup();
      }
    });
  }

  _openPopup(context) {
    const { props } = context;

    const {
      entryId,
      element,
      label,
      sourceField,
      onCollapse,
      type
    } = props;

    this._closePopup();

    this._entryId = entryId;
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
    if (this._entryId) {
      this._onCollapse?.();

      this._entryId = null;
      this._onCollapse = null;

      this._eventBus.fire('propertiesPanelPopup.close');
    }
  }
}

FeelPopup.$inject = [ 'eventBus', 'config.propertiesPanel' ];
