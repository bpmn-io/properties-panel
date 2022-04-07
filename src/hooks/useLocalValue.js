import {
  useRef,
  useState
} from 'preact/hooks';

export function useLocalValue(value, onInput) {
  const [ localValue, setLocalValue ] = useState(value);

  const localOnInput = ({ target }) => {
    const { value } = target;

    setLocalValue(value);

    onInput(value);
  };

  const focused = useRef(false);

  const onFocus = () => focused.current = true;

  const onBlur = () => {
    focused.current = false;

    setLocalValue(value);
  };

  return [ focused.current ? localValue : value, localOnInput, onFocus, onBlur ];
}