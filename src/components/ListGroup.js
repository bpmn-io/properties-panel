import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'preact/hooks';

import Tooltip from './entries/Tooltip';

import classnames from 'classnames';

import {
  useErrors,
  useLayoutState,
  usePrevious
} from '../hooks';

import ListItem from './ListItem';

import {
  ArrowIcon,
  CreateIcon
} from './icons';

import { PropertiesPanelContext } from '../context';

import { useStickyIntersectionObserver } from '../hooks';

const noop = () => {};

/**
 * @param {import('../PropertiesPanel').ListGroupDefinition} props
 */
export default function ListGroup(props) {
  const {
    add,
    element,
    id,
    items,
    label,
    shouldOpen = true
  } = props;

  useEffect(() => {
    if (props.shouldSort != undefined) {
      console.warn('the property \'shouldSort\' is no longer supported');
    }
  }, [ props.shouldSort ]);

  const groupRef = useRef(null);

  const [ open, setOpen ] = useLayoutState(
    [ 'groups', id, 'open' ],
    false
  );

  const [ sticky, setSticky ] = useState(false);

  const onShow = useCallback(() => setOpen(true), [ setOpen ]);

  // Flag to mark that add button was clicked in the last render cycle
  const [ addTriggered, setAddTriggered ] = useState(false);

  const prevItems = usePrevious(items);
  const prevElement = usePrevious(element);

  const elementChanged = element !== prevElement;
  const shouldHandleEffects = !elementChanged && shouldOpen;

  // (0) open parent container when items were added
  useEffect(() => {
    if (shouldHandleEffects && prevItems && items.length > prevItems.length) {

      // open if not open, configured and triggered by add button
      //
      // TODO(marstamm): remove once we refactor layout handling for listGroups.
      // Ideally, opening should be handled as part of the `add` callback and
      // not be a concern for the ListGroup component.
      if (addTriggered && !open && shouldOpen) {
        toggleOpen();
      }
    }
  }, [ items, open, shouldHandleEffects, addTriggered ]);

  // (1) open new child containers when items were added
  //
  // we need to it with a useMemo hook so it is detected
  // in the same render cycle as the new item is added.
  // This is important, because the autoOpen property can
  // only set per list item on an item's very first render.
  const autoOpenItemIds = useMemo(() => {

    // auto open only if configured and triggered by add button
    if (!shouldHandleEffects || !shouldOpen || !addTriggered || !prevItems) {
      return [];
    }

    const previousItemIds = prevItems.map(item => item.id);
    const currentItemsIds = items.map(item => item.id);

    return currentItemsIds.filter(id => !previousItemIds.includes(id));
  }, [ items ]);

  // set css class when group is sticky to top
  useStickyIntersectionObserver(groupRef, 'div.bio-properties-panel-scroll-container', setSticky);

  const toggleOpen = () => setOpen(!open);

  const hasItems = !!items.length;

  const propertiesPanelContext = {
    ...useContext(PropertiesPanelContext),
    onShow
  };

  const handleAddClick = e => {
    setAddTriggered(true);
    add(e);
  };

  const allErrors = useErrors();
  const hasError = items.some(item => {
    if (allErrors[item.id]) {
      return true;
    }

    if (!item.entries) {
      return;
    }

    // also check if the error is nested, e.g. for name-value entries
    return item.entries.some(entry => allErrors[entry.id]);
  }
  );

  return <div class="bio-properties-panel-group" data-group-id={ 'group-' + id } ref={ groupRef }>
    <div
      class={ classnames(
        'bio-properties-panel-group-header',
        hasItems ? '' : 'empty',
        (hasItems && open) ? 'open' : '',
        (sticky && open) ? 'sticky' : ''
      ) }
      onClick={ hasItems ? toggleOpen : noop }>
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
          add
            ? (
              <button
                type="button"
                title="Create new list item"
                class="bio-properties-panel-group-header-button bio-properties-panel-add-entry"
                onClick={ handleAddClick }
              >
                <CreateIcon />
                {
                  !hasItems ? (
                    <span class="bio-properties-panel-add-entry-label">Create</span>
                  )
                    : null
                }
              </button>
            )
            : null
        }
        {
          hasItems
            ? (
              <div
                title={ `List contains ${items.length} item${items.length != 1 ? 's' : ''}` }
                class={
                  classnames(
                    'bio-properties-panel-list-badge',
                    hasError ? 'bio-properties-panel-list-badge--error' : ''
                  )
                }
              >
                { items.length }
              </div>
            )
            : null
        }
        {
          hasItems
            ? (
              <button
                type="button"
                title="Toggle section"
                class="bio-properties-panel-group-header-button bio-properties-panel-arrow"
              >
                <ArrowIcon class={ open ? 'bio-properties-panel-arrow-down' : 'bio-properties-panel-arrow-right' } />
              </button>
            )
            : null
        }
      </div>
    </div>
    <div class={ classnames(
      'bio-properties-panel-list',
      open && hasItems ? 'open' : ''
    ) }>
      <PropertiesPanelContext.Provider value={ propertiesPanelContext }>

        {
          items.map((item, index) => {
            if (!item) {
              return;
            }

            const { id } = item;

            // if item was added, open it
            // Existing items will not be affected as autoOpen is only applied on first render
            const autoOpen = autoOpenItemIds.includes(item.id);

            return (
              <ListItem
                { ...item }
                autoOpen={ autoOpen }
                element={ element }
                index={ index }
                key={ id } />
            );
          })
        }
      </PropertiesPanelContext.Provider>
    </div>
  </div>;
}