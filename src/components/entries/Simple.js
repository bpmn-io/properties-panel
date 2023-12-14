import {
  useMemo,
  useEffect,
  useState
} from 'preact/hooks';

/**
 * @param {Object} props
 * @param {Function} props.debounce
 * @param {Boolean} [props.disabled]
 * @param {Object} props.element
 * @param {Function} props.getValue
 * @param {String} props.id
 * @param {Function} [props.onBlur]
 * @param {Function} [props.onFocus]
 * @param {Function} props.setValue
 */
export default function Simple(props) {
  const {
    debounce,
    disabled,
    element,
    getValue,
    id,
    onBlur,
    onFocus,
    setValue
  } = props;

  const value = getValue(element);

  const [ localValue, setLocalValue ] = useState(value);

  const handleInputCallback = useMemo(() => {
    return debounce((target) => setValue(target.value.length ? target.value : undefined));
  }, [ setValue, debounce ]);

  const handleInput = e => {
    handleInputCallback(e.target);
    setLocalValue(e.target.value);
  };

  useEffect(() => {
    if (value === localValue) {
      return;
    }

    setLocalValue(value);
  }, [ value ]);


  return (
    <div class="bio-properties-panel-simple">
      <input
        id={ prefixId(id) }
        key={ element }
        type="text"
        name={ id }
        spellCheck="false"
        autoComplete="off"
        disabled={ disabled }
        class="bio-properties-panel-input"
        onInput={ handleInput }
        aria-label={ localValue || '<empty>' }
        onFocus={ onFocus }
        onBlur={ onBlur }
        value={ localValue } />
    </div>
  );
}

export function isEdited(node) {
  return node && !!node.value;
}


// helpers /////////////////

function prefixId(id) {
  return `bio-properties-panel-${ id }`;
}
