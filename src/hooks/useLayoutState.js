import {
  useCallback,
  useContext
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

  const setState = useCallback((newValue) => {
    setLayoutForKey(path, newValue);
  }, [ setLayoutForKey ]);


  return [ layoutForKey, setState ];
}
