import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useLayoutEffect
} from 'preact/hooks';

import {
  assign,
  get,
  isArray,
  set
} from 'min-dash';

import Header from './components/Header';

import Group from './components/Group';

import Placeholder from './components/Placeholder';

import {
  DescriptionContext,
  ErrorsContext,
  EventContext,
  LayoutContext,
  PropertiesPanelContext,
  ShowEntryContext,
  TooltipContext
} from './context';

import { useEvent } from './hooks';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

const DEFAULT_LAYOUT = {};

const DEFAULT_DESCRIPTION = {};

const DEFAULT_TOOLTIP = {};


/**
 * @typedef { {
 *    component: import('preact').Component,
 *    id: String,
 *    isEdited?: Function
 * } } EntryDefinition
 *
 * @typedef { {
 *    autoFocusEntry: String,
 *    autoOpen?: Boolean,
 *    entries: Array<EntryDefinition>,
 *    id: String,
 *    label: String,
 *    remove: (event: MouseEvent) => void
 * } } ListItemDefinition
 *
 * @typedef { {
 *    add: (event: MouseEvent) => void,
 *    component: import('preact').Component,
 *    element: Object,
 *    id: String,
 *    items: Array<ListItemDefinition>,
 *    label: String,
 *    shouldOpen?: Boolean
 * } } ListGroupDefinition
 *
 * @typedef { {
 *    component?: import('preact').Component,
 *    entries: Array<EntryDefinition>,
 *    id: String,
 *    label: String,
 *    shouldOpen?: Boolean
 * } } GroupDefinition
 *
 *  @typedef { {
 *    [id: String]: GetDescriptionFunction
 * } } DescriptionConfig
 *
 *  @typedef { {
 *    [id: String]: GetTooltipFunction
 * } } TooltipConfig
 *
 * @callback { {
 * @param {string} id
 * @param {Object} element
 * @returns {string}
 * } } GetDescriptionFunction
 *
 * @callback { {
 * @param {string} id
 * @param {Object} element
 * @returns {string}
 * } } GetTooltipFunction
 *
 * @typedef { {
 *  getEmpty: (element: object) => import('./components/Placeholder').PlaceholderDefinition,
 *  getMultiple: (element: Object) => import('./components/Placeholder').PlaceholderDefinition
 * } } PlaceholderProvider
 *
 */


/**
 * A basic properties panel component. Describes *how* content will be rendered, accepts
 * data from implementor to describe *what* will be rendered.
 *
 * @param {Object} props
 * @param {Object|Array} props.element
 * @param {import('./components/Header').HeaderProvider} props.headerProvider
 * @param {PlaceholderProvider} [props.placeholderProvider]
 * @param {Array<GroupDefinition|ListGroupDefinition>} props.groups
 * @param {Object} [props.layoutConfig]
 * @param {Function} [props.layoutChanged]
 * @param {DescriptionConfig} [props.descriptionConfig]
 * @param {Function} [props.descriptionLoaded]
 * @param {TooltipConfig} [props.tooltipConfig]
 * @param {Function} [props.tooltipLoaded]
 * @param {HTMLElement} [props.feelPopupContainer]
 * @param {Function} [props.getFeelPopupLinks]
 * @param {Object} [props.eventBus]
 */
export default function PropertiesPanel(props) {
  const {
    element,
    headerProvider,
    placeholderProvider,
    groups,
    layoutConfig,
    layoutChanged,
    descriptionConfig,
    descriptionLoaded,
    tooltipConfig,
    tooltipLoaded,
    eventBus
  } = props;

  // set-up layout context
  const [ layout, setLayout ] = useState(createLayout(layoutConfig));

  // react to external changes in the layout config
  useUpdateLayoutEffect(() => {
    const newLayout = createLayout(layoutConfig);

    setLayout(newLayout);
  }, [ layoutConfig ]);

  useEffect(() => {
    if (typeof layoutChanged === 'function') {
      layoutChanged(layout);
    }
  }, [ layout, layoutChanged ]);

  const getLayoutForKey = (key, defaultValue) => {
    return get(layout, key, defaultValue);
  };

  const setLayoutForKey = (key, config) => {
    setLayout((prevLayout) => {
      const newLayout = assign({}, prevLayout);
      set(newLayout, key, config);
      return newLayout;
    });
  };

  const layoutContext = {
    layout,
    setLayout,
    getLayoutForKey,
    setLayoutForKey
  };

  // set-up description context
  const description = useMemo(() => createDescriptionContext(descriptionConfig), [ descriptionConfig ]);

  useEffect(() => {
    if (typeof descriptionLoaded === 'function') {
      descriptionLoaded(description);
    }
  }, [ description, descriptionLoaded ]);


  const getDescriptionForId = (id, element) => {
    return description[id] && description[id](element);
  };

  const descriptionContext = {
    description,
    getDescriptionForId
  };

  // set-up tooltip context
  const tooltip = useMemo(() => createTooltipContext(tooltipConfig), [ tooltipConfig ]);

  useEffect(() => {
    if (typeof tooltipLoaded === 'function') {
      tooltipLoaded(tooltip);
    }
  }, [ tooltip, tooltipLoaded ]);

  const getTooltipForId = (id, element) => {
    return tooltip[id] && tooltip[id](element);
  };

  const tooltipContext = {
    tooltip,
    getTooltipForId
  };

  const [ errors, setErrors ] = useState({});

  const onSetErrors = ({ errors }) => setErrors(errors);

  useEvent('propertiesPanel.setErrors', onSetErrors, eventBus);

  const errorsContext = {
    errors
  };

  const eventContext = {
    eventBus
  };

  // set-up showEntry coordinator
  //
  // Tracks pending `propertiesPanel.showEntry` requests at the panel level so
  // that groups can open themselves and entries can focus reliably, even when
  // they are not yet mounted at the time the event fires.
  const [ pendingRequest, setPendingRequest ] = useState(null);
  const pendingTokenRef = useRef(0);

  const requestShow = useCallback((id) => {
    if (!id) {
      return;
    }
    pendingTokenRef.current += 1;
    setPendingRequest({ id, token: pendingTokenRef.current });
  }, []);

  const resolveShow = useCallback((token) => {
    setPendingRequest((prev) => (prev && prev.token === token ? null : prev));
  }, []);

  const onShowEntry = useCallback((event) => {
    if (event && event.id) {
      requestShow(event.id);
    }
  }, [ requestShow ]);

  useEvent('propertiesPanel.showEntry', onShowEntry, eventBus);

  // Track the most recently committed request token. This lets us tell
  // whether a `pendingRequest` present at the time of an element change
  // was already alive in the previous render (→ stale, cancel) or was
  // issued in the same render batch as the element change itself
  // (→ keep, the consumer wants to focus an entry on the new element).
  const lastCommittedTokenRef = useRef(0);

  // cancel pending show-entry request when the selected element changes —
  // but only if the request was issued before the element change. Requests
  // batched together with the element change (a common pattern: select(el)
  // followed synchronously by fire('propertiesPanel.showEntry', ...)) are
  // preserved so the entry on the new element gets focused.
  //
  // useUpdateLayoutEffect avoids clobbering requests made during the
  // initial render.
  useUpdateLayoutEffect(() => {
    setPendingRequest((prev) => {
      if (prev && prev.token > lastCommittedTokenRef.current) {
        return prev;
      }
      return null;
    });
  }, [ element ]);

  useEffect(() => {
    if (pendingRequest) {
      lastCommittedTokenRef.current = pendingRequest.token;
    }
  }, [ pendingRequest ]);

  const showEntryContext = useMemo(() => ({
    pendingRequest,
    requestShow,
    resolve: resolveShow
  }), [ pendingRequest, requestShow, resolveShow ]);

  const propertiesPanelContext = {
    element
  };

  // empty state
  if (placeholderProvider && !element) {
    return <Placeholder { ...placeholderProvider.getEmpty() } />;
  }

  // multiple state
  if (placeholderProvider && isArray(element)) {
    return <Placeholder { ...placeholderProvider.getMultiple() } />;
  }

  return (
    <PropertiesPanelContext.Provider value={ propertiesPanelContext }>
      <ErrorsContext.Provider value={ errorsContext }>
        <DescriptionContext.Provider value={ descriptionContext }>
          <TooltipContext.Provider value={ tooltipContext }>
            <LayoutContext.Provider value={ layoutContext }>
              <EventContext.Provider value={ eventContext }>
                <ShowEntryContext.Provider value={ showEntryContext }>
                  <div class="bio-properties-panel">
                    <Header
                      element={ element }
                      headerProvider={ headerProvider } />
                    <div class="bio-properties-panel-scroll-container">
                      {
                        groups.map(group => {
                          const {
                            component: Component = Group,
                            id
                          } = group;

                          return (
                            <Component
                              { ...group }
                              key={ id }
                              element={ element } />
                          );
                        })
                      }
                    </div>
                  </div>
                </ShowEntryContext.Provider>
              </EventContext.Provider>
            </LayoutContext.Provider>
          </TooltipContext.Provider>
        </DescriptionContext.Provider>
      </ErrorsContext.Provider>
    </PropertiesPanelContext.Provider>
  );
}


// helpers //////////////////

function createLayout(overrides = {}, defaults = DEFAULT_LAYOUT) {
  return {
    ...defaults,
    ...overrides
  };
}

function createDescriptionContext(overrides = {}) {
  return {
    ...DEFAULT_DESCRIPTION,
    ...overrides
  };
}

function createTooltipContext(overrides = {}) {
  return {
    ...DEFAULT_TOOLTIP,
    ...overrides
  };
}

// hooks //////////////////

/**
 * This hook behaves like useLayoutEffect, but does not trigger on the first render.
 *
 * @param {Function} effect
 * @param {Array} deps
 */
function useUpdateLayoutEffect(effect, deps) {
  const isMounted = useRef(false);

  useLayoutEffect(() => {
    if (isMounted.current) {
      return effect();
    } else {
      isMounted.current = true;
    }
  }, deps);
}