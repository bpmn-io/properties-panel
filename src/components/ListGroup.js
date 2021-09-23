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
  CreateIcon,
  GroupArrowIcon
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
    shouldSort = true
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
  const shouldHandleEffects = !elementChanged && shouldSort;

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

      // sort + open if closed
      if (!open) {
        newOrdering = createOrdering(sortItems(items));
        toggleOpen();
      }

      // add new items on top
      newOrdering = removeDuplicates([
        ...add,
        ...newOrdering
      ]);

      setOrdering(newOrdering);
      setNewItemAdded(true);
    } else {
      setNewItemAdded(false);
    }
  }, [ items, open, shouldHandleEffects ]);

  // (2) sort items on open
  useEffect(() => {

    // we already sorted as items were added
    if (shouldHandleEffects && open && !newItemAdded) {
      setOrdering(createOrdering(sortItems(items)));
    }
  }, [ open, shouldHandleEffects ]);

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
        hasItems ? '' : 'empty'
      ) }
      onClick={ hasItems ? toggleOpen : noop }>
      <div title={ getTitleAttribute(label, items) } class="bio-properties-panel-group-header-title">
        { label }
      </div>
      <div class="bio-properties-panel-group-header-buttons">
        {
          AddContainer
            ? (
              <AddContainer>
                <button class="bio-properties-panel-group-header-button bio-properties-panel-add-entry">
                  <CreateIcon />
                </button>
              </AddContainer>
            )
            : null
        }
        {
          hasItems
            ? (
              <div class="bio-properties-panel-list-badge">
                { items.length }
              </div>
            )
            : null
        }
        {
          hasItems
            ? (
              <button class="bio-properties-panel-group-header-button">
                <GroupArrowIcon class={ open ? 'bio-properties-panel-arrow-down' : 'bio-properties-panel-arrow-right' } />
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
              autoOpen={ index === 0 && newItemAdded } // open first item when recently added
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

function removeDuplicates(items) {
  return items.filter((i, index) => items.indexOf(i) === index);
}

function getTitleAttribute(label, items) {
  const count = items.length;

  return label + (count ? ` (${count} item${count != 1 ? 's' : ''})` : '');
}