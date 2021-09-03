import { useMemo } from 'preact/hooks';

const KEY_LENGTH = 6;

/**
 * Create a persistent key factory for plain objects without id.
 *
 * @example
 * ```jsx
 * function List({ objects }) {
 *   const getKey = useKeyFactory();
 *   return (<ol>{
 *     objects.map(obj => {
 *       const key = getKey(obj);
 *       return <li key={key}>obj.name</li>
 *     })
 *   }</ol>);
 * }
 * ```
 *
 * @param {any[]} dependencies
 * @returns {(element: object) => string}
 */
export function useKeyFactory(dependencies = []) {
  const map = useMemo(() => new Map(), dependencies);

  const getKey = el => {
    let key = map.get(el);

    if (!key) {
      key = Math.random().toString().slice(-KEY_LENGTH);
      map.set(el, key);
    }

    return key;
  };

  return getKey;
}
