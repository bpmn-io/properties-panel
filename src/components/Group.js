import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'preact/hooks';

import Tooltip from './entries/Tooltip';

import classnames from 'classnames';

import {
  query as domQuery
} from 'min-dom';

import {
  isFunction
} from 'min-dash';

import {
  useErrors,
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

  const [ sticky, setSticky ] = useState(false);

  // set edited state depending on all entries
  useEffect(() => {

    // TODO(@barmac): replace with CSS when `:has()` is supported in all major browsers, or rewrite as in https://github.com/camunda/camunda-modeler/issues/3815#issuecomment-1733038161
    const scheduled = requestAnimationFrame(() => {
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
    });

    return () => cancelAnimationFrame(scheduled);
  }, [ entries, setEdited ]);

  // set error state depending on all entries
  const allErrors = useErrors();
  const hasErrors = entries.some(entry => allErrors[entry.id]);

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
      <div
        title={ props.tooltip ? null : label }
        data-title={ label }
        class="bio-properties-panel-group-header-title"
      >
        <Tooltip value={ props.tooltip } forId={ 'group-' + id } element={ element } parent={ groupRef }>
          { label }
        </Tooltip>
      </div>
      <div class="bio-properties-panel-group-header-buttons">
        {
          <DataMarker
            edited={ edited }
            hasErrors={ hasErrors }
          />
        }
        <button
          type="button"
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

function DataMarker(props) {
  const {
    edited,
    hasErrors
  } = props;

  if (hasErrors) {
    return (
      <div title="Section contains an error" class="bio-properties-panel-dot bio-properties-panel-dot--error"></div>
    );
  }

  if (edited) {
    return (
      <div title="Section contains data" class="bio-properties-panel-dot"></div>
    );
  }
  return null;
}