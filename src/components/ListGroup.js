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
  find,
  sortBy
} from 'min-dash';

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
    shouldOpen = true,
    shouldSort = true
  } = props;


  const groupRef = useRef(null);

  const [ open, setOpen ] = useLayoutState(
    [ 'groups', id, 'open' ],
    false
  );

  const [ sticky, setSticky ] = useState(false);

  const onShow = useCallback(() => setOpen(true), [ setOpen ]);

  const [ ordering, setOrdering ] = useState([]);
  const [ newItemAdded, setNewItemAdded ] = useState(false);

  // Flag to mark that add button was clicked in the last render cycle
  const [ addTriggered, setAddTriggered ] = useState(false);

  const prevItems = usePrevious(items);
  const prevElement = usePrevious(element);

  const elementChanged = element !== prevElement;
  const shouldHandleEffects = !elementChanged && (shouldSort || shouldOpen);

  // reset initial ordering when element changes (before first render)
  if (elementChanged) {
    setOrdering(createOrdering(shouldSort ? sortItems(items) : items));
  }

  // keep ordering in sync to items - and open changes

  // (0) set initial ordering from given items
  useEffect(() => {
    if (!prevItems || !shouldSort) {
      setOrdering(createOrdering(items));
    }
  }, [ items, element ]);

  // (1) items were added
  useEffect(() => {

    // reset addTriggered flag
    setAddTriggered(false);

    if (shouldHandleEffects && prevItems && items.length > prevItems.length) {

      let add = [];

      items.forEach(item => {
        if (!ordering.includes(item.id)) {
          add.push(item.id);
        }
      });

      let newOrdering = ordering;

      // open if not open, configured and triggered by add button
      //
      // TODO(marstamm): remove once we refactor layout handling for listGroups.
      // Ideally, opening should be handled as part of the `add` callback and
      // not be a concern for the ListGroup component.
      if (addTriggered && !open && shouldOpen) {
        toggleOpen();
      }

      // filter when not open and configured
      if (!open && shouldSort) {
        newOrdering = createOrdering(sortItems(items));
      }

      // add new items on top or bottom depending on sorting behavior
      newOrdering = newOrdering.filter(item => !add.includes(item));
      if (shouldSort) {
        newOrdering.unshift(...add);
      } else {
        newOrdering.push(...add);
      }

      setOrdering(newOrdering);
      setNewItemAdded(addTriggered);
    } else {
      setNewItemAdded(false);
    }
  }, [ items, open, shouldHandleEffects, addTriggered ]);

  // (2) sort items on open if shouldSort is set
  useEffect(() => {

    if (shouldSort && open && !newItemAdded) {
      setOrdering(createOrdering(sortItems(items)));
    }
  }, [ open, shouldSort ]);

  // (3) items were deleted
  useEffect(() => {
    if (shouldHandleEffects && prevItems && items.length < prevItems.length) {
      let keep = [];

      ordering.forEach(o => {
        if (getItem(items, o)) {
          keep.push(o);
        }
      });

      setOrdering(keep);
    }
  }, [ items, shouldHandleEffects ]);

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
          ordering.map((o, index) => {
            const item = getItem(items, o);

            if (!item) {
              return;
            }

            const { id } = item;

            // if item was added, open it
            // Existing items will not be affected as autoOpen is only applied on first render
            const autoOpen = newItemAdded;

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


// helpers ////////////////////

/**
 * Sorts given items alphanumeric by label
 */
function sortItems(items) {
  return sortBy(items, i => i.label.toLowerCase());
}

function getItem(items, id) {
  return find(items, i => i.id === id);
}

function createOrdering(items) {
  return items.map(i => i.id);
}
