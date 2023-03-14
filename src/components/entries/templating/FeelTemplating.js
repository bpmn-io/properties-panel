import { useCallback, useEffect, useState, useMemo, useRef } from 'preact/hooks';
import { usePrevious, useStaticCallback, useShowEntryEvent } from '../../../hooks';
import { isFunction } from 'min-dash';
import { useError } from '../../../hooks';
import classnames from 'classnames';
import Description from '../Description';
import FeelTemplatingEditor from './FeelTemplatingEditor';

const noop = () => { };

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
 * @param {Function} props.tooltipContainer
 * @param {Function} props.validate
 * @param {Function} props.show
 */
export default function FeelTemplatingEntry(props) {
  const {
    element,
    id,
    description,
    debounce,
    disabled,
    label,
    getValue,
    setValue,
    tooltipContainer,
    validate,
    show = noop,
  } = props;

  const [ cachedInvalidValue, setCachedInvalidValue ] = useState(null);
  const [ validationError, setValidationError ] = useState(null);
  const [ localError, setLocalError ] = useState(null);

  let value = getValue(element);

  const previousValue = usePrevious(value);

  useEffect(() => {
    if (isFunction(validate)) {
      const newValidationError = validate(value) || null;

      setValidationError(newValidationError);
    }
  }, [ value ]);

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

  const onError = useCallback(err => {
    setLocalError(err);
  }, []);

  if (previousValue === value && validationError) {
    value = cachedInvalidValue;
  }

  const temporaryError = useError(id);

  const error = localError || temporaryError || validationError;

  return (
    <div
      class={ classnames(
        'bio-properties-panel-entry',
        error ? 'has-error' : '')
      }
      data-entry-id={ id }>
      <FeelTemplating
        debounce={ debounce }
        disabled={ disabled }
        id={ id }
        key={ element }
        label={ label }
        onInput={ onInput }
        onError={ onError }
        show={ show }
        value={ value }
        tooltipContainer={ tooltipContainer } />
      {error && <div class="bio-properties-panel-error">{error}</div>}
      <Description forId={ id } element={ element } value={ description } />
    </div>
  );
}

function FeelTemplating(props) {
  const {
    debounce,
    id,
    label,
    onInput,
    onError,
    value = '',
    disabled = false,
    tooltipContainer
  } = props;

  const [ localValue, setLocalValue ] = useState(value);

  const editorRef = useShowEntryEvent(id);
  const containerRef = useRef();

  const [ focus, _setFocus ] = useState(undefined);

  const setFocus = (offset = 0) => {
    const hasFocus = containerRef.current.contains(document.activeElement);

    // Keep caret position if it is already focused, otherwise focus at the end
    const position = hasFocus ? document.activeElement.selectionStart : Infinity;

    _setFocus(position + offset);
  };

  const handleInputCallback = useMemo(() => {
    return debounce((newValue) => onInput(newValue.length ? newValue : undefined));
  }, [ onInput, debounce ]);

  const handleInput = newValue => {
    handleInputCallback(newValue);
    setLocalValue(newValue);
  };

  const handleLint = useStaticCallback(lint => {

    const errors = lint && lint.length && lint.filter(e => e.severity === 'error') || [];

    if (!errors.length) {
      onError(undefined);
      return;
    }

    const error = lint[0];
    const message = `${error.source}: ${error.message}`;

    onError(message);
  });

  useEffect(() => {
    if (typeof focus !== 'undefined') {
      editorRef.current.focus(focus);
      _setFocus(undefined);
    }
  }, [ focus ]);

  useEffect(() => {
    if (value === localValue) {
      return;
    }
    setLocalValue(value ? value : '');
  }, [ value ]);

  return (
    <div class="bio-properties-panel-feelers">
      <label id={ prefixIdLabel(id) } class="bio-properties-panel-label" onClick={ () => setFocus() }>
        { label }
      </label>
      <div class="bio-properties-panel-feelers-input" ref={ containerRef }>
        <FeelTemplatingEditor
          name={ id }
          onInput={ handleInput }
          contentAttributes={ { 'aria-labelledby' : prefixIdLabel(id) } }
          disabled={ disabled }
          onLint={ handleLint }
          value={ localValue }
          useGutters={ false }
          ref={ editorRef }
          tooltipContainer={ tooltipContainer }
        />
      </div>
    </div>
  );
}

export function isEdited(node) {
  return node && (!!node.value || node.classList.contains('edited'));
}

// helpers /////////////////

function prefixIdLabel(id) {
  return `bio-properties-panel-feelers-${id}-label`;
}