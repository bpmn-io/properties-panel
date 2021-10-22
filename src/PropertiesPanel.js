import {
  useState,
  useEffect
} from 'preact/hooks';

import {
  get,
  set
} from 'min-dash';

import classnames from 'classnames';

import Header from './components/Header';

import Group from './components/Group';

import {
  LayoutContext
} from './context';

const DEFAULT_LAYOUT = {
  open: true
};


/**
 * @typedef { {
 *    component: import('preact').ComponentChild,
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
 */
export default function PropertiesPanel(props) {
  const {
    element,
    headerProvider,
    groups,
    layoutConfig = {},
    layoutChanged
  } = props;

  const [ layout, setLayout ] = useState(createLayoutContext(layoutConfig));

  useEffect(() => {
    if (typeof layoutChanged === 'function') {
      layoutChanged(layout);
    }
  }, [ layout, layoutChanged ]);

  const getLayoutForKey = (key, defaultValue) => {
    return get(layout, key, defaultValue);
  };

  const setLayoutForKey = (key, config) => {
    setLayout(set(layout, key, config));
  };

  const layoutContext = {
    layout,
    setLayout,
    getLayoutForKey,
    setLayoutForKey
  };

  if (!element) {
    return <div class="bio-properties-panel-placeholder">Select an element to edit its properties.</div>;
  }

  return <LayoutContext.Provider value={ layoutContext }>
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
              component: GroupComponent = Group,
              id
            } = group;

            return <GroupComponent
              key={ id }
              element={ element }
              { ...group } />;
          })
        }
      </div>
    </div>
  </LayoutContext.Provider>;
}


// helpers //////////////////

function createLayoutContext(overrides) {
  return {
    ...DEFAULT_LAYOUT,
    ...overrides
  };
}
