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
  usePrevious,
  useShowEntryEvent,
  useShowErrorEvent
} from '../../hooks';

import CodeEditor from './CodeEditor';

const noop = () => {};



function FeelTextfield(props) {
  const {
    debounce,
    disabled = false,
    id,
    label,
    onInput,
    feel = false,
    value = '',
    show = noop
  } = props;


  const ref = useShowEntryEvent(show);

  const handleInput = useMemo(() => {
    return debounce(({ target }) => onInput(target.value.length ? target.value : undefined));
  }, [ onInput, debounce ]);

  return (
    <div class="bio-properties-panel-textfield">
      <label for={ prefixId(id) } class="bio-properties-panel-label">
        { label }
        {feel && <FeelIcon feel={ feel } label={ label } />}
      </label>

      <CodeEditor
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
        value={ value || '' }
      />
    </div>
  );
}


function Textfield(props) {

  const {
    debounce,
    disabled = false,
    id,
    label,
    onInput,
    feel = false,
    value = '',
    show = noop
  } = props;

  const ref = useShowEntryEvent(show);

  const handleInput = useMemo(() => {
    return debounce(({ target }) => onInput(target.value.length ? target.value : undefined));
  }, [ onInput, debounce ]);

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
    feel,
    label,
    getValue,
    setValue,
    validate,
    show = noop
  } = props;

  const [ cachedInvalidValue, setCachedInvalidValue ] = useState(null);
  const [ validationError, setValidationError ] = useState(null);

  let value = getValue(element);

  const previousValue = usePrevious(value);

  useEffect(() => {
    if (isFunction(validate)) {
      const newValidationError = validate(value) || null;

      setValidationError(newValidationError);
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

    setValidationError(newValidationError);
  };

  if (previousValue === value && validationError) {
    value = cachedInvalidValue;
  }

  const temporaryError = useShowErrorEvent(show);

  const error = temporaryError || validationError;

  return (
    <div
      class={ classnames(
        'bio-properties-panel-entry',
        error ? 'has-error' : '')
      }
      data-entry-id={ id }>
      {feel ?
        <FeelTextfield
          debounce={ debounce }
          disabled={ disabled }
          feel={ feel }
          id={ id }
          label={ label }
          onInput={ onInput }
          show={ show }
          value={ value } /> :
        <Textfield
          debounce={ debounce }
          disabled={ disabled }
          feel={ feel }
          id={ id }
          label={ label }
          onInput={ onInput }
          show={ show }
          value={ value } />
      }
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



function getTokenType(node) {

  const {
    name,
    error
  } = node;

  if (error) {
    return 'error';
  }

  if (name === 'BuiltInFunctionName') {
    return 'builtin';
  }

  if (
    name === 'BuiltInType' ||
    name === 'ListType' ||
    name === 'ContextType' ||
    name === 'FunctionType'
  ) {
    return 'builtin';
  }

  if (name === 'BlockComment' || name === 'LineComment') {
    return 'comment';
  }

  if (name === 'Parameters') {
    return 'parameters';
  }

  if (name === 'List') {
    return 'list';
  }

  if (name === 'Context') {
    return 'context';
  }

  if (name === 'Interval') {
    return 'interval';
  }

  if (name === 'StringLiteral') {
    return 'string';
  }

  if (name === 'NumericLiteral') {
    return 'number';
  }

  if (name === 'BooleanLiteral') {
    return 'boolean';
  }

  if (name === 'QualifiedName') {
    return 'qname';
  }

  if (name === 'Name') {
    return 'name';
  }

}