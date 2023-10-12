import {
  useEffect,
  useRef,
  useState
} from 'preact/hooks';

import classnames from 'classnames';

/**
 *
 * @param {object} props
 * @param {string} [props.class]
 * @param {import('preact').Component[]} [props.menuItems]
 * @returns
 */
export function DropdownButton(props) {
  const {
    class: className,
    children,
    menuItems = []
  } = props;

  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  const [ open, setOpen ] = useState(false);
  const close = () => setOpen(false);

  function onDropdownToggle(event) {
    if (menuRef.current && menuRef.current.contains(event.target)) {
      return;
    }

    event.stopPropagation();

    setOpen(open => !open);
  }

  function onActionClick(event, action) {
    event.stopPropagation();

    close();
    action();
  }

  useGlobalClick([ dropdownRef.current ], () => close());

  return (
    <div
      class={ classnames('bio-properties-panel-dropdown-button', { open }, className) }
      onClick={ onDropdownToggle }
      ref={ dropdownRef }
    >
      { children }
      <div class="bio-properties-panel-dropdown-button__menu" ref={ menuRef }>
        { menuItems.map((item, index) => (
          <MenuItem onClick={ onActionClick } item={ item } key={ index } />
        )) }
      </div>
    </div>
  );
}

function MenuItem({ item, onClick }) {
  if (item.separator) {
    return <div class="bio-properties-panel-dropdown-button__menu-item bio-properties-panel-dropdown-button__menu-item--separator" />;
  }

  if (item.action) {
    return (<button
      type="button"
      class="bio-properties-panel-dropdown-button__menu-item bio-properties-panel-dropdown-button__menu-item--actionable"
      onClick={ event => onClick(event, item.action) }
    >
      {item.entry}
    </button>);
  }

  return <div
    class="bio-properties-panel-dropdown-button__menu-item"
  >
    {item.entry}
  </div>;
}

/**
 *
 * @param {Array<null | Element>} ignoredElements
 * @param {Function} callback
 */
function useGlobalClick(ignoredElements, callback) {
  useEffect(() => {

    /**
     * @param {MouseEvent} event
     */
    function listener(event) {
      if (ignoredElements.some(element => element && element.contains(event.target))) {
        return;
      }

      callback();
    }

    document.addEventListener('click', listener, { capture: true });

    return () => document.removeEventListener('click', listener, { capture: true });
  }, [ ...ignoredElements, callback ]);
}
