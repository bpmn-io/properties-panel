import {
  useEffect,
  useRef,
  useState
} from 'preact/hooks';

import {
  query as domQuery
} from 'min-dom';

import { isFunction } from 'min-dash';

import {
  useKeyFactory,
  usePrevious
} from '../../hooks';

import classnames from 'classnames';

import {
  ArrowIcon,
  CreateIcon,
  DeleteIcon
} from '../icons';

/**
 * Entry for handling lists represented as nested entries.
 *
 * @template Item
 * @param {object} props
 * @param {string} props.id
 * @param {*} props.element
 * @param {Function} props.onAdd
 * @param {import('preact').Component} props.component
 * @param {string} [props.label='<empty>']
 * @param {Function} [props.onRemove]
 * @param {Item[]} [props.items]
 * @param {boolean} [props.open]
 * @param {string|boolean} [props.autoFocusEntry] either a custom selector string or true to focus the first input
 * @param {(a: Item, b: Item) => -1 | 0 | 1} [props.compareFn]
 * @returns
 */
export default function List(props) {
  const {
    id,
    element,
    items = [],
    component,
    label = '<empty>',
    open: shouldOpen,
    onAdd,
    onRemove,
    autoFocusEntry,
    compareFn,
    ...restProps
  } = props;

  const [ open, setOpen ] = useState(!!shouldOpen);

  const hasItems = !!items.length;
  const toggleOpen = () => hasItems && setOpen(!open);

  const opening = !usePrevious(open) && open;
  const elementChanged = usePrevious(element) !== element;
  const shouldReset = opening || elementChanged;
  const sortedItems = useSortedItems(items, compareFn, shouldReset);

  const newItems = useNewItems(items, elementChanged);

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
        hasItems ? '' : 'empty',
        open ? 'open' : ''
      ) }>
      <div class="bio-properties-panel-list-entry-header" onClick={ toggleOpen }>
        <div
          title={ label }
          class={ classnames(
            'bio-properties-panel-list-entry-header-title',
            open && 'open'
          ) }>
          { label }
        </div>
        <div
          class="bio-properties-panel-list-entry-header-buttons"
        >
          <button
            type="button"
            title="Create new list item"
            onClick={ addItem }
            class="bio-properties-panel-add-entry"
          >
            <CreateIcon />
            {
              !hasItems ? (
                <span class="bio-properties-panel-add-entry-label">Create</span>
              )
                : null
            }
          </button>
          {
            hasItems && (
              <div
                title={ `List contains ${items.length} item${items.length != 1 ? 's' : ''}` }
                class="bio-properties-panel-list-badge"
              >
                { items.length }
              </div>
            )
          }
          {
            hasItems && (
              <button
                type="button"
                title="Toggle list item"
                class="bio-properties-panel-arrow"
              >
                <ArrowIcon class={ open ? 'bio-properties-panel-arrow-down' : 'bio-properties-panel-arrow-right' } />
              </button>
            )
          }
        </div>
      </div>
      {
        hasItems && (
          <ItemsList
            { ...restProps }
            autoFocusEntry={ autoFocusEntry }
            component={ component }
            element={ element }
            id={ id }
            items={ sortedItems }
            newItems={ newItems }
            onRemove={ onRemove }
            open={ open }
          />
        )
      }
    </div>
  );
}

function ItemsList(props) {
  const {
    autoFocusEntry,
    component: Component,
    element,
    id,
    items,
    newItems,
    onRemove,
    open,
    ...restProps
  } = props;

  const getKey = useKeyFactory();

  const newItem = newItems[0];

  useEffect(() => {
    if (newItem && autoFocusEntry) {

      // (0) select the parent entry (containing all list items)
      const entry = domQuery(`[data-entry-id="${id}"]`);

      // (1) select the first input or a custom element to be focussed
      const selector = typeof(autoFocusEntry) === 'boolean' ?
        '.bio-properties-panel-input' :
        autoFocusEntry;
      const focusableInput = domQuery(selector, entry);

      // (2) set focus
      if (focusableInput) {

        if (isFunction(focusableInput.select)) {
          focusableInput.select();
        } else if (isFunction(focusableInput.focus)) {
          focusableInput.focus();
        }

      }
    }
  }, [ newItem, autoFocusEntry, id ]);

  return <ol class={ classnames(
    'bio-properties-panel-list-entry-items',
    open ? 'open' : ''
  ) }>
    {
      items.map((item, index) => {
        const key = getKey(item);

        return (<li class="bio-properties-panel-list-entry-item" key={ key }>
          <Component
            { ...restProps }
            element={ element }
            id={ id }
            index={ index }
            item={ item }
            open={ item === newItem } />
          {
            onRemove && (
              <button
                type="button"
                title="Delete item"
                class="bio-properties-panel-remove-entry bio-properties-panel-remove-list-entry"
                onClick={ () => onRemove && onRemove(item) }
              ><DeleteIcon /></button>
            )
          }
        </li>);
      })
    }
  </ol>;
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

    // (2) Add new item to the list.
    for (const item of currentItems) {
      if (!items.includes(item)) {

        // Unshift or push depending on whether we have a compareFn
        compareFn ? items.unshift(item) : items.push(item);
      }
    }

    // (3) Filter out removed items.
    itemsRef.current = items.filter(item => currentItems.includes(item));
  }

  return itemsRef.current;
}

function useNewItems(items = [], shouldReset) {
  const previousItems = usePrevious(items.slice()) || [];

  if (shouldReset) {
    return [];
  }

  return previousItems ? items.filter(item => !previousItems.includes(item)) : [];
}
