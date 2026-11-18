import { cloneElement, render } from 'preact';
import { flushSync } from 'preact/compat';
import { query as domQuery } from 'min-dom';
import { isString } from 'min-dash';

import { EventContext, LayoutContext } from '../../context';

import { useEvent, useLayoutState, useStaticCallback } from '../../hooks';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }


export class PopupRenderer {
  constructor(eventBus) {
    this._eventBus = eventBus;

    this._container = null;
    this._element = null;

    eventBus.on('propertiesPanelPopup.open', (context) => {
      this._renderPopup(context);
    });

    eventBus.on('propertiesPanelPopup.close', () => {
      this._removePopup();
    });
  }

  _renderPopup(context) {
    let { container, config } = context;

    const layoutContext = this._eventBus.fire('propertiesPanel.getLayoutContext');

    container = this._container = getContainer(container) || document.body;

    const element = this._element = createElement();

    container.appendChild(element);

    this._emit('feelPopup.open');

    const Component = config.component;
    const content = <Component { ...config } eventBus={ this._eventBus } />;

    render(
      <EventContext.Provider value={ { eventBus: this._eventBus } }>
        { layoutContext ? (
          <LayoutContext.Provider value={ layoutContext }>
            <PopupLayout type={ config.type }>{ content }</PopupLayout>
          </LayoutContext.Provider>
        ) : content }
      </EventContext.Provider>,
      element
    );

    this._emit('feelPopup.opened', {
      domNode: element
    });
  }

  _removePopup() {
    if (!this._container) {
      return;
    }

    this._emit('feelPopup.close', {
      domNode: this._element
    });

    render(null, this._element);

    this._element.remove();

    this._container = null;
    this._element = null;

    this._emit('feelPopup.closed');
  }

  _emit(event, context) {
    this._eventBus.fire(event, context);
  }
}

PopupRenderer.$inject = [ 'eventBus' ];

/**
 * Restore and save popup size and position through the panel's layout context.
 */
function PopupLayout({ type = 'text', children }) {
  const [ popupLayout, setPopupLayout ] = useLayoutState([ 'popups', type ], {});

  const saveSizeAndPosition = useStaticCallback(({ domNode }) => {
    const element = domQuery('.bio-properties-panel-popup', domNode);

    if (!element?.isConnected) {
      return;
    }

    const { width, height, top, left } = element.getBoundingClientRect();

    // Flush the shared layout before a following detach can unmount the panel.
    flushSync(() => setPopupLayout({
      size: { width, height },
      position: { top, left }
    }));
  });

  useEvent('feelPopup.close', saveSizeAndPosition);

  return cloneElement(children, {
    ...popupLayout.size,
    position: popupLayout.position,
    ...children.props
  });
}

// helpers /////////////////

function createElement() {
  const element = document.createElement('div');

  element.classList.add('bio-properties-panel-popup-container');

  return element;
}

function getContainer(container) {
  if (isString(container)) {
    return domQuery(container);
  }

  return container;
}