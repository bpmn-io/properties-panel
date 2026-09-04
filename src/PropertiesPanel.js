import {
  useState,
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
  DiagnosticsContext,
  ErrorsContext,
  EventContext,
  LayoutContext,
  PropertiesPanelContext,
  TooltipContext
} from './context';

import { useEvent } from './hooks';

import { toDiagnostic, toErrorDiagnostic } from './components/util/diagnostics';

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
 *    label: String|import('preact').ComponentChildren,
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
 *    shouldOpen?: Boolean,
 *    translate?: Function
 * } } ListGroupDefinition
 *
 * @typedef { {
 *    component?: import('preact').Component,
 *    entries: Array<EntryDefinition>,
 *    id: String,
 *    label: String,
 *    shouldOpen?: Boolean,
 *    translate?: Function
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
 * If `headerProvider` is omitted (or `null`), the built-in `<Header>` is not rendered;
 * consumers can render `<Header>` standalone elsewhere using the same provider shape.
 *
 * @param {Object} props
 * @param {Object|Array} props.element
 * @param {import('./components/Header').HeaderProvider} [props.headerProvider]
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

  const [ diagnostics, setDiagnostics ] = useState({});

  const onSetDiagnostics = ({ diagnostics }) => setDiagnostics(diagnostics);

  useEvent('propertiesPanel.setDiagnostics', onSetDiagnostics, eventBus);

  const [ errors, setErrors ] = useState({});

  const onSetErrors = ({ errors }) => setErrors(errors);

  useEvent('propertiesPanel.setErrors', onSetErrors, eventBus);

  // externally provided diagnostics take precedence over the deprecated errors
  const allDiagnostics = useMemo(
    () => createDiagnostics(diagnostics, errors),
    [ diagnostics, errors ]
  );

  const diagnosticsContext = useMemo(() => ({
    diagnostics: allDiagnostics
  }), [ allDiagnostics ]);

  const errorsContext = useMemo(() => ({
    errors: createErrors(allDiagnostics)
  }), [ allDiagnostics ]);

  const eventContext = {
    eventBus
  };

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
      <DiagnosticsContext.Provider value={ diagnosticsContext }>
        <ErrorsContext.Provider value={ errorsContext }>
          <DescriptionContext.Provider value={ descriptionContext }>
            <TooltipContext.Provider value={ tooltipContext }>
              <LayoutContext.Provider value={ layoutContext }>
                <EventContext.Provider value={ eventContext }>
                  <div class="bio-properties-panel">
                    { headerProvider ? (
                      <Header
                        element={ element }
                        headerProvider={ headerProvider } />
                    ) : null }
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
                </EventContext.Provider>
              </LayoutContext.Provider>
            </TooltipContext.Provider>
          </DescriptionContext.Provider>
        </ErrorsContext.Provider>
      </DiagnosticsContext.Provider>
    </PropertiesPanelContext.Provider>
  );
}


// helpers //////////////////

/**
 * Merge the diagnostics with the ones provided through the deprecated errors,
 * keyed by entry ID.
 *
 * @param {Object<String, Array<import('./components/util/diagnostics').Diagnostic>>} diagnostics
 * @param {Object<String, String>} errors
 *
 * @returns {Object<String, Array<import('./components/util/diagnostics').Diagnostic>>}
 */
function createDiagnostics(diagnostics, errors) {
  const merged = {};

  for (const id in diagnostics) {
    merged[ id ] = asArray(diagnostics[ id ]).map(diagnostic => toDiagnostic(diagnostic)).filter(Boolean);
  }

  for (const id in errors) {
    const error = toErrorDiagnostic(errors[ id ]);

    if (error) {
      merged[ id ] = [ ...(merged[ id ] || []), error ];
    }
  }

  return merged;
}

/**
 * Project the diagnostics of severity <error> to the deprecated errors,
 * keyed by entry ID.
 *
 * @param {Object<String, Array<import('./components/util/diagnostics').Diagnostic>>} diagnostics
 *
 * @returns {Object<String, String>}
 */
function createErrors(diagnostics) {
  const errors = {};

  for (const id in diagnostics) {
    const error = diagnostics[ id ].find(({ severity }) => severity === 'error');

    if (error) {
      errors[ id ] = error.message;
    }
  }

  return errors;
}

function asArray(value) {
  return isArray(value) ? value : [ value ];
}

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