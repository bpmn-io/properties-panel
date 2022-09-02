import {
  useState,
  useEffect
} from 'preact/hooks';

import {
  assign,
  get,
  isArray,
  set
} from 'min-dash';

import classnames from 'classnames';

import Header from './components/Header';

import Group from './components/Group';

import Placeholder from './components/Placeholder';

import {
  DescriptionContext,
  ErrorsContext,
  EventContext,
  LayoutContext,
  OverridesContext,
  PropertiesPanelContext
} from './context';

import {
  useEvent,
  useEventBuffer
} from './hooks';

const DEFAULT_LAYOUT = {
  open: true
};

const DEFAULT_DESCRIPTION = {};

const DEFAULT_OVERRIDES = {};

const bufferedEvents = [
  'propertiesPanel.showEntry',
  'propertiesPanel.setErrors'
];


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
 *    shouldSort?: Boolean,
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
 * @callback { {
 * @param {string} id
 * @param {Object} element
 * @returns {string}
 * } } GetDescriptionFunction
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
 * @param {Function} [props.descriptionLoaded]
 * @param {DescriptionConfig} [props.descriptionConfig]
 * @param {Object} [props.eventBus]
 * @param {Object|Array} props.element
 * @param {Array<GroupDefinition|ListGroupDefinition>} props.groups
 * @param {import('./components/Header').HeaderProvider} props.headerProvider
 * @param {Function} [props.layoutChanged]
 * @param {Object} [props.layoutConfig]
 * @param {Object} [props.overridesConfig]
 * @param {PlaceholderProvider} [props.placeholderProvider]
 */
export default function PropertiesPanel(props) {
  const {
    descriptionConfig = {},
    descriptionLoaded,
    element,
    eventBus,
    groups,
    headerProvider,
    layoutChanged,
    layoutConfig = {},
    overridesConfig = {},
    placeholderProvider
  } = props;

  // set-up layout context
  const [ layout, setLayout ] = useState(createLayout(layoutConfig));

  useEffect(() => {
    if (typeof layoutChanged === 'function') {
      layoutChanged(layout);
    }
  }, [ layout, layoutChanged ]);

  const getLayoutForKey = (key, defaultValue) => {
    return get(layout, key, defaultValue);
  };

  const setLayoutForKey = (key, config) => {
    const newLayout = assign({}, layout);
    set(newLayout, key, config);
    setLayout(newLayout);
  };

  const layoutContext = {
    layout,
    setLayout,
    getLayoutForKey,
    setLayoutForKey
  };

  // set-up description context
  const description = createDescriptionContext(descriptionConfig);

  if (typeof descriptionLoaded === 'function') {
    descriptionLoaded(description);
  }

  const getDescriptionForId = (id, element) => {
    return description[id] && description[id](element);
  };

  const descriptionContext = {
    description,
    getDescriptionForId
  };

  // set-up overrides context
  const overrides = createOverridesContext(overridesConfig);

  const getOverridesForId = (id) => {
    return overrides[id] || {};
  };

  const overridesContext = {
    overrides,
    getOverridesForId
  };

  // set-up errors context
  useEventBuffer(bufferedEvents, eventBus);

  const [ errors, setErrors ] = useState({});

  const onSetErrors = ({ errors }) => setErrors(errors);

  useEvent('propertiesPanel.setErrors', onSetErrors, eventBus);

  const errorsContext = {
    errors
  };

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
      <ErrorsContext.Provider value={ errorsContext }>
        <OverridesContext.Provider value={ overridesContext }>
          <DescriptionContext.Provider value={ descriptionContext }>
            <LayoutContext.Provider value={ layoutContext }>
              <EventContext.Provider value={ eventContext }>
                <div
                  class={ classnames(
                    'bio-properties-panel',
                    layout.open ? 'open' : '')
                  }>
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
              </EventContext.Provider>
            </LayoutContext.Provider>
          </DescriptionContext.Provider>
        </OverridesContext.Provider>
      </ErrorsContext.Provider>
    </PropertiesPanelContext.Provider>
  );
}


// helpers //////////////////

function createLayout(overrides) {
  return {
    ...DEFAULT_LAYOUT,
    ...overrides
  };
}

function createDescriptionContext(overrides) {
  return {
    ...DEFAULT_DESCRIPTION,
    ...overrides
  };
}

function createOverridesContext(overrides) {
  return {
    ...DEFAULT_OVERRIDES,
    ...overrides
  };
}