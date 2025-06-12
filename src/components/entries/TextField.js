import Description from './Description';
import Tooltip from './Tooltip';

import {
  useEffect,
  useState
} from 'preact/hooks';

import classnames from 'classnames';

import { TextInput } from '../shared/TextInput';

import {
  useError,
  useShowEntryEvent
} from '../../hooks';

function Textfield(props) {

  const {
    disabled = false,
    id,
    label,
    onInput,
    onFocus,
    onBlur,
    placeholder,
    value = '',
    tooltip
  } = props;

  const [ localValue, setLocalValue ] = useState(value || '');

  const ref = useShowEntryEvent(id);

  const handleOnBlur = () => {
    onBlur?.(localValue);
  };

  const handleInput = newValue => {
    const newModelValue = newValue === '' ? undefined : newValue;
    onInput(newModelValue);
  };

  const handleLocalInput = e => {

    if (e.target.value === localValue) {
      return;
    }

    setLocalValue(e.target.value);
    handleInput(e.target.value);
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
        <Tooltip value={ tooltip } forId={ id } element={ props.element }>
          { label }
        </Tooltip>
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
        onInput={ handleLocalInput }
        onFocus={ onFocus }
        onBlur={ handleOnBlur }
        placeholder={ placeholder }
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
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 * @param {string|import('preact').Component} props.tooltip
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
    validate,
    onFocus,
    onBlur,
    placeholder,
    tooltip
  } = props;

  const value = getValue(element);

  const globalError = useError(id);

  const localError = validate?.(value) || null;

  const error = globalError || localError;

  return (
    <div
      class={ classnames(
        'bio-properties-panel-entry',
        error ? 'has-error' : '')
      }
      data-entry-id={ id }>
      <TextInput
        Component={ Textfield }
        debounce={ debounce }
        disabled={ disabled }
        getValue={ getValue }
        id={ id }
        key={ element }
        label={ label }
        onFocus={ onFocus }
        onBlur={ onBlur }
        placeholder={ placeholder }
        setValue={ setValue }
        validate={ validate }
        value={ value }
        tooltip={ tooltip }
        element={ element } />
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