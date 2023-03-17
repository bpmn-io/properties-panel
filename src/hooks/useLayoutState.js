import {
  useContext,
  useState
} from 'preact/hooks';

import {
  LayoutContext
} from '../context';

/**
 * Creates a state that persists in the global LayoutContext.
 *
 * @example
 * ```jsx
 * function Group(props) {
 *   const [ open, setOpen ] = useLayoutState([ 'groups', 'foo', 'open' ], false);
 * }
 * ```
 *
 * @param {(string|number)[]} path
 * @param {any} [defaultValue]
 *
 * @returns {[ any, Function ]}
 */
export function useLayoutState(path, defaultValue) {
  const {
    getLayoutForKey,
    setLayoutForKey
  } = useContext(LayoutContext);

  const layoutForKey = getLayoutForKey(path, defaultValue);
  const [ value, set ] = useState(layoutForKey);

  const setState = (newValue) => {

    // (1) set component state
    set(newValue);

    // (2) set context
    setLayoutForKey(path, newValue);
  };

  return [ value, setState ];
}
