import {
  useEffect,
  useState
} from 'preact/hooks';

import classnames from 'classnames';

import {
  find,
  sortBy
} from 'min-dash';

import {
  useLayoutState,
  usePrevious
} from '../hooks';

import ListItem from './ListItem';

import {
  ArrowIcon,
  CreateIcon
} from './icons';

const noop = () => {};

/**
 * @param {import('../PropertiesPanel').ListGroupDefinition} props
 */
export default function ListGroup(props) {
  const {
    element,
    id,
    items,
    label,
    add: AddContainer,
    shouldSort = true,
    shouldOpen = true
  } = props;


  const [ open, setOpen ] = useLayoutState(
    [ 'groups', id, 'open' ],
    false
  );

  const [ ordering, setOrdering ] = useState([]);
  const [ newItemAdded, setNewItemAdded ] = useState(false);

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
    if (shouldHandleEffects && prevItems && items.length > prevItems.length) {

      let add = [];

      items.forEach(item => {
        if (!ordering.includes(item.id)) {
          add.push(item.id);
        }
      });

      let newOrdering = ordering;

      // open if not open and configured
      if (!open && shouldOpen) {
        toggleOpen();

        // if I opened and I should sort, then sort items
        if (shouldSort) {
          newOrdering = createOrdering(sortItems(items));
        }
      }

      // add new items on top or bottom depending on sorting behavior
      newOrdering = newOrdering.filter(item => !add.includes(item));
      if (shouldSort) {
        newOrdering.unshift(...add);
      } else {
        newOrdering.push(...add);
      }

      setOrdering(newOrdering);
      setNewItemAdded(true);
    } else {
      setNewItemAdded(false);
    }
  }, [ items, open, shouldHandleEffects ]);

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

  const toggleOpen = () => setOpen(!open);

  const hasItems = !!items.length;

  return <div class="bio-properties-panel-group" data-group-id={ 'group-' + id }>
    <div
      class={ classnames(
        'bio-properties-panel-group-header',
        hasItems ? '' : 'empty',
        (hasItems && open) ? 'open' : ''
      ) }
      onClick={ hasItems ? toggleOpen : noop }>
      <div
        title={ label }
        class="bio-properties-panel-group-header-title"
      >
        { label }
      </div>
      <div class="bio-properties-panel-group-header-buttons">
        {
          AddContainer
            ? (
              <AddContainer>
                <button
                  title="Create new list item"
                  class="bio-properties-panel-group-header-button bio-properties-panel-add-entry"
                >
                  <CreateIcon />
                </button>
              </AddContainer>
            )
            : null
        }
        {
          hasItems
            ? (
              <div
                title={ `List contains ${items.length} item${items.length != 1 ? 's' : ''}` }
                class="bio-properties-panel-list-badge"
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
      {
        ordering.map((o, index) => {
          const item = getItem(items, o);

          if (!item) {
            return;
          }

          return (
            <ListItem
              key={ item.id }

              // if item was added, open first or last item based on ordering
              autoOpen={ newItemAdded && (shouldSort ? index === 0 : index === ordering.length - 1) }
              { ...item } />
          );
        })
      }
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
