import Description from './Description';

import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'preact/hooks';

import classnames from 'classnames';

import { isFunction, isString } from 'min-dash';

import {
  usePrevious,
  useShowEntryEvent,
  useShowErrorEvent,
  useStaticCallback
} from '../../hooks';

import CodeEditor from './util/CodeEditor';
import { FeelToggle } from './util/FeelToogle';
import FeelIcon from './FeelIcon';

const noop = () => {};

function FeelTextfield(props) {
  const {
    debounce,
    id,
    label,
    onInput,
    feel,
    value = '',
    show = noop
  } = props;

  const [localValue, setLocalValue] = useState(value);

  const feelActive = localValue.startsWith('=') || feel === 'required';
  const feelOnlyValue = localValue.substring(1);

  const [focus, setFocus] = useState();

  const ref = useShowEntryEvent(show);

  const handleInputCallback = useMemo(() => {
    return debounce(onInput);
  }, [ onInput, debounce ]);

  const handleFeelToggle = useStaticCallback(() => {
    if (feel === 'required') {
      return;
    }

    setFocus(true);

    if (!feelActive) {
      setLocalValue('=' + localValue);
    } else {
      setLocalValue(feelOnlyValue);
    }
  });

  const handleLocalInput = (newValue) => {
    if (!isString(newValue)) {
      newValue = newValue.target.value;
    }

    if (feelActive) {
      newValue = '=' + newValue;
    }

    if (newValue === localValue) {
      return;
    }

    setLocalValue(newValue);

    if (!feelActive && newValue.startsWith('=')) {
      setFocus(true);
    }
  };

  useEffect(() => {
    if (focus) {
      ref.current?.setSelectionRange?.(0, 0);
      ref.current?.focus?.();
      setFocus(false);
    }
  }, [ focus ]);

  useEffect(() => {
    if (value === localValue) {
      return;
    }

    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    handleInputCallback(localValue);
  }, [localValue]);

  return (
    <div class="bio-properties-panel-textfield">
      <label for={ prefixId(id) } class="bio-properties-panel-label">
        { label }
        <FeelIcon
          label={ label }
          feel={ feel }></FeelIcon>
      </label>

      <div class="bio-icon-left">
        <FeelToggle
          active={ feelActive }
          disabled={ feel !== 'optional' }
          onClick={ handleFeelToggle }
        />
        {feelActive ?
          <CodeEditor
            onInput={ handleLocalInput }
            onDisable={ handleFeelToggle }
            value={ feelOnlyValue }
            focus={ focus }
          /> :
          <OptionalFeelInput
            { ...props }
            onInput={ handleLocalInput }
            value={ localValue }
            focus={ focus }
          />
        }
      </div>
    </div>
  );
}

function OptionalFeelInput(props) {
  const {
    id,
    disabled,
    onInput,
    value,
    focus
  } = props;

  const ref = useRef();

  useEffect(() => {
    if (focus && ref.current) {
      ref.current.focus();
    }
  }, [ref, focus]);

  return <input
    ref={ ref }
    id={ prefixId(id) }
    type="text"
    name={ id }
    spellCheck="false"
    autoComplete="off"
    disabled={ disabled }
    class="bio-properties-panel-input"
    onInput={ onInput }
    onFocus={ props.onFocus }
    onBlur={ props.onBlur }
    value={ value || '' } />;
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
export default function FeelEntry(props) {
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
      <FeelTextfield
        debounce={ debounce }
        disabled={ disabled }
        feel={ feel }
        id={ id }
        label={ label }
        onInput={ onInput }
        example={ props.example }
        show={ show }
        value={ value }
        variables={ props.variables } />
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
