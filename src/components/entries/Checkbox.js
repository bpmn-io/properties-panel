import {
  useShowEntryEvent,
  useShowErrorEvent
} from '../../hooks';

import {
  useEffect,
  useState
} from 'preact/hooks';

import Description from './Description';

const noop = () => {};

function Checkbox(props) {
  const {
    id,
    label,
    onChange,
    disabled,
    value = false,
    show = noop
  } = props;

  const [localValue, setLocalValue] = useState(value);

  const handleChangeCallback = ({ target }) => {
    onChange(target.checked);
  };

  const handleChange = e => {
    handleChangeCallback(e);
    setLocalValue(e.target.value);
  };

  useEffect(() => {
    if (value === localValue) {
      return;
    }

    setLocalValue(value);
  }, [value]);

  const ref = useShowEntryEvent(show);

  return (
    <div class="bio-properties-panel-checkbox">
      <input
        ref={ ref }
        id={ prefixId(id) }
        name={ id }
        type="checkbox"
        class="bio-properties-panel-input"
        onChange={ handleChange }
        checked={ localValue }
        disabled={ disabled } />
      <label for={ prefixId(id) } class="bio-properties-panel-label">{ label }</label>
    </div>
  );
}


/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.description
 * @param {String} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {boolean} [props.disabled]
 */
export default function CheckboxEntry(props) {
  const {
    element,
    id,
    description,
    label,
    getValue,
    setValue,
    disabled,
    show = noop
  } = props;

  const value = getValue(element);

  const error = useShowErrorEvent(show);

  return (
    <div class="bio-properties-panel-entry bio-properties-panel-checkbox-entry" data-entry-id={ id }>
      <Checkbox
        disabled={ disabled }
        id={ id }
        label={ label }
        onChange={ setValue }
        show={ show }
        value={ value } />
      { error && <div class="bio-properties-panel-error">{ error }</div> }
      <Description forId={ id } element={ element } value={ description } />
    </div>
  );
}

export function isEdited(node) {
  return node && !!node.checked;
}


// helpers /////////////////

function prefixId(id) {
  return `bio-properties-panel-${ id }`;
}
