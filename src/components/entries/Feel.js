import Description from './Description';
import FeelIcon from './FeelIcon';

import {
  useEffect,
  useMemo,
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

const noop = () => {};

function FeelTextfield(props) {
  const {
    debounce,
    disabled = false,
    id,
    label,
    onInput,
    feel,
    value = '',
    show = noop
  } = props;

  const feelActive = value.startsWith('=') || feel === 'required';
  const feelOnlyValue = value.substring(1);

  const [setFocus, setSetFocus] = useState();

  const ref = useShowEntryEvent(show);

  const handleFeelInput = useMemo(() => {
    return debounce((newValue) => {
      onInput('=' + newValue);
    });
  }, [ onInput, debounce ]);


  const handleTextInput = useMemo(() => {
    return debounce((newValue) => {
      onInput(newValue);
    });
  }, [ onInput, debounce ]);


  const handleFeelToggle = useStaticCallback(() => {
    setSetFocus(true);
    if (!feelActive) {
      onInput('=' + value);
    } else {
      onInput(feelOnlyValue);
    }
  });

  const handleLocalInput = (newValue) => {
    if (!isString(newValue)) {
      newValue = newValue.target.value;
    }

    if (newValue === feelOnlyValue) {
      return;
    }

    var f = feelActive ? handleFeelInput : handleTextInput;

    f(newValue);

    if (!feelActive && newValue.startsWith('=')) {
      setSetFocus(true);
      f.flush();
    }
  };

  useEffect(() => {
    if (setFocus) {
      ref.current?.setSelectionRange?.(0, 0);
      ref.current?.focus?.();
      setSetFocus(false);
    }
  }, [ setFocus ]);

  return (
    <div class="bio-properties-panel-textfield">
      <label for={ prefixId(id) } class="bio-properties-panel-label">
        { label }
      </label>

      <div class="bio-icon-left">
        <FeelToggle
          active={ feelActive }
          disabled={ feel !== 'optional' }
          onClick={ handleFeelToggle }
        />
        {feelActive ? <CodeEditor
          ref={ ref }
          id={ prefixId(id) }
          type="text"
          name={ id }
          spellCheck="false"
          autoComplete="off"
          disabled={ disabled }
          class="bio-properties-panel-input"
          example={ props.example }
          variables={ props.variables }
          onInput={ handleLocalInput }
          onDisable={ handleFeelToggle }
          onFocus={ props.onFocus }
          onBlur={ props.onBlur }
          value={ feelOnlyValue }
          focus={ setFocus }
        /> : <input
          ref={ ref }
          id={ prefixId(id) }
          type="text"
          name={ id }
          spellCheck="false"
          autoComplete="off"
          disabled={ disabled }
          class="bio-properties-panel-input"
          onInput={ handleLocalInput }
          onFocus={ props.onFocus }
          onBlur={ props.onBlur }
          value={ value || '' } />
        }
      </div>
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
