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

import translateFallback from './util/translateFallback';

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
    shouldOpen = false,
    translate = translateFallback
  } = props;

  useEffect(() => {
    if (props.shouldSort != undefined) {
      console.warn('the property \'shouldSort\' is no longer supported');
    }
  }, [ props.shouldSort ]);

  const groupRef = useRef(null);

  const [ open, setOpen ] = useLayoutState(
    [ 'groups', id, 'open' ],
    shouldOpen
  );

  const [ sticky, setSticky ] = useState(false);

  const onShow = useCallback(() => setOpen(true), [ setOpen ]);

  const [ localItems, setLocalItems ] = useState([]);

  // Flag to mark that add button was clicked in the last render cycle
  const [ addTriggered, setAddTriggered ] = useState(false);

  const prevElement = usePrevious(element);

  const toggleOpen = useCallback(() => setOpen(!open), [ open ]);

  const openItemIds = (element === prevElement && open && addTriggered)
    ? getNewItemIds(items, localItems)
    : [];

  // reset local state after items changed
  useEffect(() => {
    setLocalItems(items);
    setAddTriggered(false);
  }, [ items ]);

  // set css class when group is sticky to top
  useStickyIntersectionObserver(groupRef, 'div.bio-properties-panel-scroll-container', setSticky);

  const hasItems = !!items.length;

  const propertiesPanelContext = {
    ...useContext(PropertiesPanelContext),
    onShow
  };

  const handleAddClick = e => {
    setAddTriggered(true);
    setOpen(true);

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
  });


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
                title={ translate('Create new list item') }
                class="bio-properties-panel-group-header-button bio-properties-panel-add-entry"
                onClick={ handleAddClick }
              >
                <CreateIcon />
                {
                  !hasItems ? (
                    <span class="bio-properties-panel-add-entry-label">{ translate('Create') }</span>
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
                title={ translate(`List contains {numOfItems} item${items.length != 1 ? 's' : ''}`, { numOfItems: items.length }) }
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
                title={ translate('Toggle section') }
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
            // existing items will not be affected as autoOpen
            // is only applied on first render
            const autoOpen = openItemIds.includes(item.id);

            return (
              <ListItem
                { ...item }
                autoOpen={ autoOpen }
                element={ element }
                index={ index }
                key={ id }
                translate={ translate } />
            );
          })
        }
      </PropertiesPanelContext.Provider>
    </div>
  </div>;
}


function getNewItemIds(newItems, oldItems) {
  const newIds = newItems.map(item => item.id);
  const oldIds = oldItems.map(item => item.id);

  return newIds.filter(itemId => !oldIds.includes(itemId));
}