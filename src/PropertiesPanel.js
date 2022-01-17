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
  LayoutContext,
  DescriptionContext
} from './context';

const DEFAULT_LAYOUT = {
  open: true
};

const DEFAULT_DESCRIPTION = {};


/**
 * A basic properties panel component. Describes *how* content will be rendered, accepts
 * data from implementor to describe *what* will be rendered.
 *
 * @param {Object} props
 * @param {Object} props.element
 * @param {import('./components/Header').HeaderProvider} props.headerProvider
 * @param {import('./types').GroupDefinition[]} props.groups
 * @param {Object} [props.layoutConfig]
 * @param {Function} [props.layoutChanged]
 * @param {import('./types').DescriptionConfig} [props.descriptionConfig]
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
    descriptionLoaded
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

  if (!element) {
    return <div class="bio-properties-panel-placeholder">Select an element to edit its properties.</div>;
  }

  return <DescriptionContext.Provider value={ descriptionContext }>
    <LayoutContext.Provider value={ layoutContext }>
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
    </LayoutContext.Provider>
  </DescriptionContext.Provider>;
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
