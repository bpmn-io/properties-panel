import {
  useMemo
} from 'preact/hooks';

/**
 * @param {Object} props
 * @param {Function} props.debounce
 * @param {Boolean} [props.disabled]
 * @param {Object} props.element
 * @param {Function} props.getValue
 * @param {String} props.id
 * @param {(event: FocusEvent) => void} [props.onBlur]
 * @param {(event: FocusEvent) => void} [props.onFocus]
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

  const handleInput = useMemo(() => {
    return debounce(({ target }) => setValue(target.value.length ? target.value : undefined));
  }, [ setValue, debounce ]);

  const value = getValue(element);

  return (
    <div class="bio-properties-panel-simple">
      <input
        id={ prefixId(id) }
        type="text"
        name={ id }
        spellcheck={ false }
        autoComplete="off"
        disabled={ disabled }
        class="bio-properties-panel-input"
        onInput={ handleInput }
        onFocus={ onFocus }
        onBlur={ onBlur }
        value={ value || '' } />
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
