import {
  useEffect,
  useRef,
  useState
} from 'preact/hooks';

import {
  useKeyFactory,
  usePrevious
} from '../../hooks';

import classnames from 'classnames';

import {
  CreateIcon,
  GroupArrowIcon,
  ListDeleteIcon
} from '../icons';

/**
 * Entry for handling lists represented as nested entries.
 *
 * @template Item
 * @param {object} props
 * @param {string} props.id
 * @param {*} props.element
 * @param {Function} props.onAdd
 * @param {Function} props.renderItem
 * @param {string} [props.label='<empty>']
 * @param {Function} [props.onRemove]
 * @param {Item[]} [props.items]
 * @param {boolean} [props.open]
 * @param {(a: Item, b: Item) => -1 | 0 | 1} [props.compareFn]
 * @returns
 */
export default function List(props) {
  const {
    id,
    element,
    items = [],
    renderItem,
    label = '<empty>',
    open: shouldOpen,
    onAdd,
    onRemove,
    compareFn
  } = props;

  const [ open, setOpen ] = useState(!!shouldOpen);

  const hasItems = !!items.length;
  const toggleOpen = () => hasItems && setOpen(!open);

  const opening = !usePrevious(open) && open;
  const elementChanged = usePrevious(element) !== element;
  const shouldReset = opening || elementChanged;
  const sortedItems = useSortedItems(items, compareFn, shouldReset);

  useEffect(() => {
    if (open && !hasItems) {
      setOpen(false);
    }
  }, [ open, hasItems ]);

  /**
   * @param {MouseEvent} event
   */
  function addItem(event) {
    event.stopPropagation();
    onAdd();

    if (!open) {
      setOpen(true);
    }
  }

  return (
    <div
      data-entry-id={ id }
      class={ classnames(
        'bio-properties-panel-entry',
        'bio-properties-panel-list-entry',
        open ? 'open' : ''
      ) }>
      <div class="bio-properties-panel-list-entry-header" onClick={ toggleOpen }>
        <div
          title={ getTitle(label, items) }
          class={ classnames(
            'bio-properties-panel-list-entry-header-title',
            open && 'open'
          ) }>
          { label }
        </div>
        <div
          class="bio-properties-panel-list-entry-header-buttons"
        >
          <button onClick={ addItem } class="bio-properties-panel-add-entry">
            <CreateIcon />
          </button>
          {
            hasItems && (
              <div class="bio-properties-panel-list-badge">
                { items.length }
              </div>
            )
          }
          {
            hasItems && (
              <button class="bio-properties-panel-list-entry-arrow">
                <GroupArrowIcon class={ open ? 'bio-properties-panel-arrow-down' : 'bio-properties-panel-arrow-right' } />
              </button>
            )
          }
        </div>
      </div>
      {
        hasItems && (
          <ItemsList
            open={ open }
            items={ sortedItems }
            onRemove={ onRemove }
            renderItem={ renderItem }
          />
        )
      }
    </div>
  );
}

function ItemsList(props) {
  const {
    items,
    open,
    onRemove,
    renderItem
  } = props;

  const getKey = useKeyFactory();

  return (
    <ol class={ classnames(
      'bio-properties-panel-list-entry-items',
      open ? 'open' : ''
    ) }>
      {
        items.map((item, index) => {
          const key = getKey(item);

          return (<li class="bio-properties-panel-list-entry-item" key={ key }>
            {renderItem(item, index)}
            {
              onRemove && (
                <button
                  type="button"
                  class="bio-properties-panel-remove-entry"
                  onClick={ () => onRemove && onRemove(item) }
                ><ListDeleteIcon /></button>
              )
            }
          </li>);
        })
      }
    </ol>);
}

function getTitle(label, items) {
  if (!items.length) {
    return label;
  }

  return `${label} (${items.length} items)`;
}

/**
 * Place new items in the beginning of the list and sort the rest with provided function.
 *
 * @template Item
 * @param {Item[]} currentItems
 * @param {(a: Item, b: Item) => 0 | 1 | -1} [compareFn] function used to sort items
 * @param {boolean} [shouldReset=false] set to `true` to reset state of the hook
 * @returns {Item[]}
 */
function useSortedItems(currentItems, compareFn, shouldReset = false) {
  const itemsRef = useRef(currentItems.slice());

  // (1) Reset and optionally sort.
  if (shouldReset) {
    itemsRef.current = currentItems.slice();

    if (compareFn) {
      itemsRef.current.sort(compareFn);
    }
  } else {
    const items = itemsRef.current;

    // (2) Move new items to the beginning of the list.
    for (const item of currentItems) {
      if (!items.includes(item)) {
        items.unshift(item);
      }
    }

    // (3) Filter out removed items.
    itemsRef.current = items.filter(item => currentItems.includes(item));
  }

  return itemsRef.current;
}
