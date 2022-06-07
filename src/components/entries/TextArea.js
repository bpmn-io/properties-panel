import Description from './Description';
import FeelIcon from './FeelIcon';

import {
  useEffect,
  useMemo,
  useState
} from 'preact/hooks';

import classnames from 'classnames';

function TextArea(props) {

  const {
    id,
    label,
    rows = 2,
    debounce,
    feel,
    onInput,
    value = '',
    disabled,
    monospace
  } = props;

  const [localValue, setLocalValue] = useState(value);

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
  }, [value]);

  return (
    <div class="bio-properties-panel-textarea">
      <label for={ prefixId(id) } class="bio-properties-panel-label">
        { label }
        {feel && <FeelIcon feel={ feel } label={ label } />}
      </label>
      <textarea
        id={ prefixId(id) }
        name={ id }
        spellCheck="false"
        class={ classnames(
          'bio-properties-panel-input',
          monospace ? 'bio-properties-panel-input-monospace' : '')
        }
        onInput={ handleInput }
        onFocus={ props.onFocus }
        onBlur={ props.onBlur }
        rows={ rows }
        value={ localValue }
        disabled={ disabled } />
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
    feel,
    label,
    getValue,
    setValue,
    rows,
    monospace,
    disabled
  } = props;

  const value = getValue(element);
  return (
    <div class="bio-properties-panel-entry" data-entry-id={ id }>
      <TextArea
        id={ id }
        label={ label }
        value={ value }
        onInput={ setValue }
        rows={ rows }
        debounce={ debounce }
        monospace={ monospace }
        feel={ feel }
        disabled={ disabled } />
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
