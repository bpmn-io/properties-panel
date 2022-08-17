import Description from '../Description';

import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'preact/hooks';

import { forwardRef } from 'preact/compat';

import classnames from 'classnames';

import { isFunction } from 'min-dash';

import {
  usePrevious,
  useShowEntryEvent,
  useError,
  useStaticCallback
} from '../../../hooks';

import CodeEditor from './FeelEditor';
import { FeelIndicator } from './FeelIndicator';
import FeelIcon from './FeelIcon';

const noop = () => { };

function FeelTextfield(props) {
  const {
    debounce,
    id,
    label,
    onInput,
    feel,
    value = '',
    disabled = false,
    OptionalComponent = OptionalFeelInput
  } = props;

  const [localValue, _setLocalValue] = useState(value);

  const ref = useShowEntryEvent(id);

  const feelActive = localValue.startsWith('=') || feel === 'required';
  const feelOnlyValue = localValue.substring(1);

  const [focus, setFocus] = useState();

  const handleInputCallback = useMemo(() => {
    return debounce((newValue) => {
      onInput(newValue);
    });
  }, [onInput, debounce]);

  const setLocalValue = newValue => {
    _setLocalValue(newValue);

    if (!newValue || newValue === '=') {
      handleInputCallback(undefined);
    } else {
      handleInputCallback(newValue);
    }

  };

  const handleFeelToggle = useStaticCallback(() => {
    if (feel === 'required') {
      return;
    }

    if (!feelActive) {
      setLocalValue('=' + localValue);
    } else {
      setLocalValue(feelOnlyValue);
    }
  });

  const handleLocalInput = (newValue) => {
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
      ref.current.focus();
      setFocus(false);
    }
  }, [focus]);

  useEffect(() => {
    if (value === localValue) {
      return;
    }

    // External value change removed content => keep FEEL configuration
    if (!value) {
      setLocalValue(feelActive ? '=' : '');
      return;
    }

    setLocalValue(value);
  }, [value]);

  return (
    <div class="bio-properties-panel-feel-entry">
      <label for={ prefixId(id) } class="bio-properties-panel-label" onClick={ () => setFocus(true) }>
        {label}
        <FeelIcon
          label={ label }
          feel={ feel }
          onClick={ handleFeelToggle }
          active={ feelActive }></FeelIcon>
      </label>

      <div class="bio-properties-panel-feel-container">
        <FeelIndicator
          active={ feelActive }
          disabled={ feel !== 'optional' || disabled }
          onClick={ handleFeelToggle }
        />
        {feelActive ?
          <CodeEditor
            id={ prefixId(id) }
            name={ id }
            onInput={ handleLocalInput }
            disabled={ disabled }
            onFeelToggle={ () => { handleFeelToggle(); setFocus(true); } }
            value={ feelOnlyValue }
            variables={ props.variables }
            ref={ ref }
          /> :
          <OptionalComponent
            { ...props }
            onInput={ handleLocalInput }
            value={ localValue }
            ref={ ref }
          />
        }
      </div>
    </div>
  );
}

const OptionalFeelInput = forwardRef((props, ref) => {
  const {
    id,
    disabled,
    onInput,
    value
  } = props;

  const inputRef = useRef();

  // To be consistent with the FEEL editor, set focus at start of input
  // this ensures clean editing experience when switching with the keyboard
  ref.current = {
    focus: () => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      input.focus();
      input.setSelectionRange(0, 0);
    }
  };

  return <input
    id={ prefixId(id) }
    type="text"
    ref={ inputRef }
    name={ id }
    spellCheck="false"
    autoComplete="off"
    disabled={ disabled }
    class="bio-properties-panel-input"
    onInput={ e => onInput(e.target.value) }
    onFocus={ props.onFocus }
    onBlur={ props.onBlur }
    value={ value || '' } />;
});


const OptionalFeelTextArea = forwardRef((props, ref) => {
  const {
    id,
    disabled,
    onInput,
    value
  } = props;

  const inputRef = useRef();

  // To be consistent with the FEEL editor, set focus at start of input
  // this ensures clean editing experience when switching with the keyboard
  ref.current = {
    focus: () => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      input.focus();
      input.setSelectionRange(0, 0);
    }
  };

  return <textarea
    id={ prefixId(id) }
    type="text"
    ref={ inputRef }
    name={ id }
    spellCheck="false"
    autoComplete="off"
    disabled={ disabled }
    class="bio-properties-panel-input"
    onInput={ e => onInput(e.target.value) }
    onFocus={ props.onFocus }
    onBlur={ props.onBlur }
    value={ value || '' } />;
});

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

  const [cachedInvalidValue, setCachedInvalidValue] = useState(null);
  const [validationError, setValidationError] = useState(null);

  let value = getValue(element);

  const previousValue = usePrevious(value);

  useEffect(() => {
    if (isFunction(validate)) {
      const newValidationError = validate(value) || null;

      setValidationError(newValidationError);
    }
  }, [value]);

  const onInput = useStaticCallback((newValue) => {
    let newValidationError = null;

    if (isFunction(validate)) {
      newValidationError = validate(newValue) || null;
    }

    if (newValidationError) {
      setCachedInvalidValue(newValue);
    } else {

      // don't create multiple commandStack entries for the same value
      if (newValue !== value) {
        setValue(newValue);
      }
    }

    setValidationError(newValidationError);
  });

  if (previousValue === value && validationError) {
    value = cachedInvalidValue;
  }

  const temporaryError = useError(id);

  const error = temporaryError || validationError;

  return (
    <div
      class={ classnames(
        props.class,
        'bio-properties-panel-entry',
        error ? 'has-error' : '')
      }
      data-entry-id={ id }>
      <FeelTextfield
        debounce={ debounce }
        disabled={ disabled }
        feel={ feel }
        id={ id }
        key={ element }
        label={ label }
        onInput={ onInput }
        example={ props.example }
        show={ show }
        value={ value }
        variables={ props.variables }
        OptionalComponent={ props.OptionalComponent } />
      {error && <div class="bio-properties-panel-error">{error}</div>}
      <Description forId={ id } element={ element } value={ description } />
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
export function FeelTextArea(props) {
  return <FeelEntry class="bio-properties-panel-feel-textarea" OptionalComponent={ OptionalFeelTextArea } { ...props } />;
}

export function isEdited(node) {
  return node && (!!node.value || node.classList.contains('edited'));
}


// helpers /////////////////

function prefixId(id) {
  return `bio-properties-panel-${id}`;
}

