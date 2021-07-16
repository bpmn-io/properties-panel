import {
  useState,
  useEffect
} from 'preact/hooks';

import classnames from 'classnames';

import {
  find,
  sortBy
} from 'min-dash';

import {
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
    id,
    items,
    label,
    add: AddContainer,
    shouldSort = true
  } = props;

  const [ open, setOpen ] = useState(false);
  const [ ordering, setOrdering ] = useState([]);
  const [ newItemAdded, setNewItemAdded ] = useState(false);

  const prevItems = usePrevious(items);


  // keep ordering in sync to items and open changes

  // (0) set initial ordering from given items
  useEffect(() => {
    if (!prevItems || !shouldSort) {
      setOrdering(createOrdering(items));
    }
  }, [ items ]);

  // (1) items were added
  useEffect(() => {
    if (shouldSort && prevItems && items.length > prevItems.length) {

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
        setOpen(true);
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
  }, [ items, open ]);

  // (2) sort items on open
  useEffect(() => {

    // we already sorted as items were added
    if (shouldSort && open && !newItemAdded) {
      setOrdering(createOrdering(sortItems(items)));
    }
  }, [ open ]);

  // (3) items were deleted
  useEffect(() => {
    if (shouldSort && prevItems && items.length < prevItems.length) {
      let keep = [];

      ordering.forEach(o => {
        if (getItem(items, o)) {
          keep.push(o);
        }
      });

      setOrdering(keep);
    }
  }, [ items ]);

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
                <div class="bio-properties-panel-add-entry">
                  <CreateIcon />
                </div>
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
              <div class="bio-properties-panel-group-header-button">
                <GroupArrowIcon class={ open ? 'bio-properties-panel-arrow-down' : 'bio-properties-panel-arrow-right' } />
              </div>
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