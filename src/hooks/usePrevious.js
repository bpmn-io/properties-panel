import {
  useEffect,
  useRef,
  useState
} from 'preact/hooks';

/**
 * @pinussilvestrus: we need to introduce our own hook to persist the previous
 * state on updates.
 *
 * cf. https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
 */

export function usePrevious(value) {
  const ref = useRef(value);
  const [ prev, setPrev ] = useState(undefined);

  useEffect(() => {
    setPrev(ref.current);
    ref.current = value;
  }, [ value ]);

  return prev;
}