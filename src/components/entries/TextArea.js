import Description from './Description';

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState
} from 'preact/hooks';

import classnames from 'classnames';

import {
  useError,
  useShowEntryEvent
} from '../../hooks';

function resizeToContents(element) {
  if (!element.scrollHeight) {
    return;
  }

  element.style.height = 'auto';

  // a 2px pixel offset is required to prevent scrollbar from
  // appearing on OS with a full length scroll bar (Windows/Linux)
  element.style.height = `${ element.scrollHeight + 2 }px`;
}

function TextArea(props) {

  const {
    id,
    label,
    debounce,
    onInput,
    value = '',
    disabled,
    monospace,
    onFocus,
    onBlur,
    autoResize,
    rows = autoResize ? 1 : 2
  } = props;

  const [ localValue, setLocalValue ] = useState(value);

  const ref = useShowEntryEvent(id);

  const handleInputCallback = useMemo(() => {
    return debounce(({ target }) => onInput(target.value.length ? target.value : undefined));
  }, [ onInput, debounce ]);

  const handleInput = e => {
    handleInputCallback(e);

    autoResize && resizeToContents(e.target);

    setLocalValue(e.target.value);
  };

  useLayoutEffect(() => {
    autoResize && resizeToContents(ref.current);
  }, []);

  useEffect(() => {
    if (value === localValue) {
      return;
    }

    setLocalValue(value);
  }, [ value ]);

  return (
    <div class="bio-properties-panel-textarea">
      <label for={ prefixId(id) } class="bio-properties-panel-label">
        { label }
      </label>
      <textarea
        ref={ ref }
        id={ prefixId(id) }
        name={ id }
        spellCheck="false"
        class={ classnames(
          'bio-properties-panel-input',
          monospace ? 'bio-properties-panel-input-monospace' : '',
          autoResize ? 'auto-resize' : '')
        }
        onInput={ handleInput }
        onFocus={ onFocus }
        onBlur={ onBlur }
        rows={ rows }
        value={ localValue }
        disabled={ disabled }
        data-gramm="false"
      />
    </div>
  );
}

/**
 * @param {object} props
 * @param {object} props.element
 * @param {string} props.id
 * @param {string} props.description
 * @param {boolean} props.debounce
 * @param {string} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 * @param {number} props.rows
 * @param {boolean} props.monospace
 * @param {boolean} [props.disabled]
 */
export default function TextAreaEntry(props) {
  const {
    element,
    id,
    description,
    debounce,
    label,
    getValue,
    setValue,
    rows,
    monospace,
    disabled,
    onFocus,
    onBlur,
    autoResize
  } = props;

  const value = getValue(element);

  const error = useError(id);

  return (
    <div
      class={ classnames(
        'bio-properties-panel-entry',
        error ? 'has-error' : '')
      }
      data-entry-id={ id }>
      <TextArea
        id={ id }
        key={ element }
        label={ label }
        value={ value }
        onInput={ setValue }
        onFocus={ onFocus }
        onBlur={ onBlur }
        rows={ rows }
        debounce={ debounce }
        monospace={ monospace }
        disabled={ disabled }
        autoResize={ autoResize } />
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
