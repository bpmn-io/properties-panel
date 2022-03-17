import {
  useCallback,
  useContext,
  useEffect,
  useState
} from 'preact/hooks';

import classnames from 'classnames';

import {
  query as domQuery
} from 'min-dom';

import {
  isFunction
} from 'min-dash';

import {
  useLayoutState
} from '../hooks';

import { PropertiesPanelContext } from '../context';

import { ArrowIcon } from './icons';

/**
 * @param {import('../PropertiesPanel').GroupDefinition} props
 */
export default function Group(props) {
  const {
    element,
    entries = [],
    id,
    label
  } = props;

  const [ open, setOpen ] = useLayoutState(
    [ 'groups', id, 'open' ],
    false
  );

  const onShow = useCallback(() => setOpen(true), [ setOpen ]);

  const toggleOpen = () => setOpen(!open);

  const [ edited, setEdited ] = useState(false);

  // set edited state depending on all entries
  useEffect(() => {
    const hasOneEditedEntry = entries.find(entry => {
      const {
        id,
        isEdited
      } = entry;

      const entryNode = domQuery(`[data-entry-id="${id}"]`);

      if (!isFunction(isEdited) || !entryNode) {
        return false;
      }

      const inputNode = domQuery('.bio-properties-panel-input', entryNode);

      return isEdited(inputNode);
    });

    setEdited(hasOneEditedEntry);
  }, [ entries ]);

  const propertiesPanelContext = {
    ...useContext(PropertiesPanelContext),
    onShow
  };

  return <div class="bio-properties-panel-group" data-group-id={ 'group-' + id }>
    <div class={ classnames(
      'bio-properties-panel-group-header',
      edited ? '' : 'empty',
      open? 'open' : ''
    ) } onClick={ toggleOpen }>
      <div title={ label } class="bio-properties-panel-group-header-title">
        { label }
      </div>
      <div class="bio-properties-panel-group-header-buttons">
        {
          edited && <DataMarker />
        }
        <button
          title="Toggle section"
          class="bio-properties-panel-group-header-button bio-properties-panel-arrow"
        >
          <ArrowIcon class={ open ? 'bio-properties-panel-arrow-down' : 'bio-properties-panel-arrow-right' } />
        </button>
      </div>
    </div>
    <div class={ classnames(
      'bio-properties-panel-group-entries',
      open ? 'open' : ''
    ) }>
      <PropertiesPanelContext.Provider value={ propertiesPanelContext }>
        {
          entries.map(entry => {
            const {
              component: Component,
              id
            } = entry;

            return (
              <Component
                { ...entry }
                element={ element }
                key={ id } />
            );
          })
        }
      </PropertiesPanelContext.Provider>
    </div>
  </div>;
}

function DataMarker() {
  return (
    <div title="Section contains data" class="bio-properties-panel-dot"></div>
  );
}