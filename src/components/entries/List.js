import {
  useEffect,
  useState
} from 'preact/hooks';

import { useKeyFactory } from '../../hooks';

import classnames from 'classnames';

import {
  CreateIcon,
  GroupArrowIcon,
  ListDeleteIcon
} from '../icons';

/**
 *
 * @param {object} props
 * @param {Function} props.onAdd
 * @param {Function} props.renderItem
 * @param {Function} [props.onRemove]
 * @param {any[]} [props.items]
 * @param {string} [props.label='<empty>']
 * @param {boolean} [props.open]
 * @returns
 */
export default function List(props) {
  const {
    id,
    items = [],
    renderItem,
    label = '<empty>',
    open: shouldOpen,
    onAdd,
    onRemove
  } = props;

  const [ open, setOpen ] = useState(shouldOpen);

  const hasItems = !!items.length;
  const toggleOpen = () => hasItems && setOpen(!open);

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

  useEffect(() => {
    if (open && !hasItems) {
      setOpen(false);
    }
  }, [ open, hasItems ]);

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
            items={ items }
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
