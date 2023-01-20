import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'preact/hooks';

import classnames from 'classnames';

import {
  query as domQuery
} from 'min-dom';

import {
  isDefined,
  isFunction
} from 'min-dash';

import {
  useLayoutState
} from '../hooks';

import { PropertiesPanelContext } from '../context';

import { useStickyIntersectionObserver } from '../hooks';

import { ArrowIcon } from './icons';

/**
 * @param {import('../PropertiesPanel').GroupDefinition} props
 */
export default function Group(props) {
  const {
    element,
    entries = [],
    id,
    label,
    shouldOpen = false,
  } = props;

  const groupRef = useRef(null);

  const [ open, setOpen ] = useLayoutState(
    [ 'groups', id, 'open' ],
    shouldOpen
  );

  const onShow = useCallback(() => setOpen(true), [ setOpen ]);

  const toggleOpen = () => setOpen(!open);

  const [ edited, setEdited ] = useState(false);
  const [ error, setError ] = useState(false);

  const [ sticky, setSticky ] = useState(false);

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

  const updateError = () => {
    if (domQuery('.bio-properties-panel-error')) {
      setError(true);
      console.log('updateError', true);

    } else {
      setError(false);
      console.log('updateError', false);

    }
  };

  // set css class when group is sticky to top
  useStickyIntersectionObserver(groupRef, 'div.bio-properties-panel-scroll-container', setSticky);

  const propertiesPanelContext = {
    ...useContext(PropertiesPanelContext),
    onShow
  };

  return <div class="bio-properties-panel-group" data-group-id={ 'group-' + id } ref={ groupRef }>
    <div class={ classnames(
      'bio-properties-panel-group-header',
      edited ? '' : 'empty',
      open ? 'open' : '',
      (sticky && open) ? 'sticky' : ''
    ) } onClick={ toggleOpen }>
      <div title={ label } class="bio-properties-panel-group-header-title">
        { label }
      </div>
      <div class="bio-properties-panel-group-header-buttons">
        {
          !error && edited && <DataMarker />
        }
        {
          error && <Error />
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
                key={ id }
                updateError={ updateError } />
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

function Error() {
  return (
    <div class="bio-properties-panel-error-icon"></div>
  );
}