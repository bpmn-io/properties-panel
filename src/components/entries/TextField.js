import Description from './Description';
import FeelIcon from './FeelIcon';

import {
  useEffect,
  useMemo,
  useState
} from 'preact/hooks';

import classnames from 'classnames';

import { isFunction } from 'min-dash';

import {
  useError,
  usePrevious,
  useShowEntryEvent
} from '../../hooks';

function Textfield(props) {

  const {
    debounce,
    disabled = false,
    id,
    label,
    onInput,
    feel = false,
    value = ''
  } = props;

  const [ localValue, setLocalValue ] = useState(value || '');

  const ref = useShowEntryEvent(id);

  const handleInputCallback = useMemo(() => {
    return debounce(({ target }) => onInput(target.value.length ? target.value : undefined));
  }, [ onInput, debounce ]);

  const handleInput = e => {
    handleInputCallback(e);
    setLocalValue(e.target.value);
  };

  useEffect(() => {
    if (value === localValue) {
      return;
    }

    setLocalValue(value);
  }, [ value ]);

  return (
    <div class="bio-properties-panel-textfield">
      <label for={ prefixId(id) } class="bio-properties-panel-label">
        { label }
        {feel && <FeelIcon feel={ feel } label={ label } />}
      </label>
      <input
        ref={ ref }
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
        value={ localValue } />
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
    feel,
    label,
    getValue,
    setValue,
    validate
  } = props;

  const [ cachedInvalidValue, setCachedInvalidValue ] = useState(null);
  const globalError = useError(id);
  const [ localError, setLocalError ] = useState(null);

  let value = getValue(element);

  const previousValue = usePrevious(value);

  useEffect(() => {
    if (isFunction(validate)) {
      const newValidationError = validate(value) || null;

      setLocalError(newValidationError);
    }
  }, [ value ]);

  const onInput = (newValue) => {
    let newValidationError = null;

    if (isFunction(validate)) {
      newValidationError = validate(newValue) || null;
    }

    if (newValidationError) {
      setCachedInvalidValue(newValue);
    } else {
      setValue(newValue);
    }

    setLocalError(newValidationError);
  };

  if (previousValue === value && localError) {
    value = cachedInvalidValue;
  }

  const error = globalError || localError;

  return (
    <div
      class={ classnames(
        'bio-properties-panel-entry',
        error ? 'has-error' : '')
      }
      data-entry-id={ id }>
      <Textfield
        debounce={ debounce }
        disabled={ disabled }
        feel={ feel }
        id={ id }
        label={ label }
        onInput={ onInput }
        value={ value } />
      { error && <div class="bio-properties-panel-error">{ error }</div> }
      <Description forId={ id } element={ element } value={ description } />
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