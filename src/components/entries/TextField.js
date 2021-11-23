import {
  useDescriptionContext
} from '../../hooks';

import {
  useEffect,
  useMemo,
  useState
} from 'preact/hooks';

import classnames from 'classnames';

import {
  usePrevious
} from '../../hooks';


function Textfield(props) {

  const {
    debounce,
    disabled = false,
    id,
    label,
    onInput,
    value = ''
  } = props;

  const handleInput = useMemo(() => {
    return debounce(({ target }) => onInput(target.value.length ? target.value : undefined));
  }, [ onInput, debounce ]);

  return (
    <div class="bio-properties-panel-textfield">
      <label for={ prefixId(id) } class="bio-properties-panel-label">{ label }</label>
      <input
        id={ prefixId(id) }
        type="text"
        name={ id }
        spellCheck="false"
        autoComplete="off"
        disabled={ disabled }
        class="bio-properties-panel-input"
        onInput={ handleInput }
        onFocus={ props.onFocus }
        onBlur={ props.onBlur }
        value={ value || '' } />
    </div>
  );
}

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.description
 * @param {Boolean} props.debounce
 * @param {Boolean} props.disabled
 * @param {String} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.validate
 */
export default function TextfieldEntry(props) {
  const {
    element,
    id,
    description,
    debounce,
    disabled,
    label,
    getValue,
    setValue,
    validate
  } = props;

  const contextDescription = useDescriptionContext(id, element);

  const [ error, setError ] = useState(null);
  const [ invalidValueCache, setInvalidValueCache ] = useState(null);

  let value = getValue(element);
  const prevValue = usePrevious(value);

  // validate again when value prop changed
  useEffect(() => {
    const err = validate ? validate(value) : null;
    setError(err);
  }, [ value ]);

  // validate on change
  const handleChange = (newValue) => {
    const err = validate ? validate(newValue) : null;

    if (err) {
      setInvalidValueCache(newValue);
    } else {
      setValue(newValue);
    }

    setError(err);
  };

  // keep showing invalid value on errors, although it was not set
  if (prevValue === value && error) {
    value = invalidValueCache;
  }

  return (
    <div class={ classnames(
      'bio-properties-panel-entry',
      error ? 'has-error' : '')
    } data-entry-id={ id }>
      <Textfield id={ id } label={ label } value={ value } onInput={ handleChange } debounce={ debounce } disabled={ disabled } />
      { (description || contextDescription) &&
      <div class="bio-properties-panel-description">
        { description || contextDescription }
      </div> }
      { error && <div class="bio-properties-panel-error">{ error }</div> }
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
