import {
  useState,
  useEffect
} from 'preact/hooks';

import {
  assign,
  get,
  set
} from 'min-dash';

import classnames from 'classnames';

import Header from './components/Header';

import Group from './components/Group';

import {
  DescriptionContext,
  EventContext,
  LayoutContext,
  PropertiesPanelContext
} from './context';

import { useEventBuffer } from './hooks';

const DEFAULT_LAYOUT = {
  open: true
};

const DEFAULT_DESCRIPTION = {};

const bufferedEvents = [
  'propertiesPanel.showEntry',
  'propertiesPanel.showError'
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
 *    label: String
 * } } GroupDefinition
 *
 *  @typedef { {
 *    [id: String]: GetDescriptionFunction
 * } } DescriptionConfig
 *
 * @callback { {
 * @param {string} id
 * @param {djs.model.base} element
 * @returns {string}
 * } } GetDescriptionFunction
 *
 */


/**
 * A basic properties panel component. Describes *how* content will be rendered, accepts
 * data from implementor to describe *what* will be rendered.
 *
 * @param {Object} props
 * @param {Object} props.element
 * @param {import('./components/Header').HeaderProvider} props.headerProvider
 * @param {Array<GroupDefinition|ListGroupDefinition>} props.groups
 * @param {Object} [props.layoutConfig]
 * @param {Function} [props.layoutChanged]
 * @param {DescriptionConfig} [props.descriptionConfig]
 * @param {Function} [props.descriptionLoaded]
 */
export default function PropertiesPanel(props) {
  const {
    element,
    headerProvider,
    groups,
    layoutConfig = {},
    layoutChanged,
    descriptionConfig = {},
    descriptionLoaded,
    eventBus
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

  useEventBuffer(bufferedEvents, eventBus);

  const eventContext = {
    eventBus
  };

  const propertiesPanelContext = {
    element
  };

  if (!element) {
    return <div class="bio-properties-panel-placeholder">Select an element to edit its properties.</div>;
  }

  return (
    <PropertiesPanelContext.Provider value={ propertiesPanelContext }>

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