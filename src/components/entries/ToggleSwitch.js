import Description from './Description';

import {
  useEffect,
  useState
} from 'preact/hooks';

function ToggleSwitch(props) {
  const {
    id,
    label,
    onInput,
    value,
    switcherLabel,
    onFocus,
    onBlur
  } = props;

  const [ localValue, setLocalValue ] = useState(value);

  const handleInputCallback = async () => {
    onInput(!value);
  };

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
    <div class="bio-properties-panel-toggle-switch">
      <label class="bio-properties-panel-label"
        for={ prefixId(id) }>
        { label }
      </label>
      <div class="bio-properties-panel-field-wrapper">
        <label class="bio-properties-panel-toggle-switch__switcher">
          <input
            id={ prefixId(id) }
            class="bio-properties-panel-input"
            type="checkbox"
            onFocus={ onFocus }
            onBlur={ onBlur }
            name={ id }
            onInput={ handleInput }
            checked={ !!localValue } />
          <span class="bio-properties-panel-toggle-switch__slider" />
        </label>
        <p class="bio-properties-panel-toggle-switch__label">{ switcherLabel }</p>
      </div>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.description
 * @param {String} props.label
 * @param {String} props.switcherLabel
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 */
export default function ToggleSwitchEntry(props) {
  const {
    element,
    id,
    description,
    label,
    switcherLabel,
    getValue,
    setValue,
    onFocus,
    onBlur
  } = props;

  const value = getValue(element);
  return (
    <div class="bio-properties-panel-entry bio-properties-panel-toggle-switch-entry" data-entry-id={ id }>
      <ToggleSwitch
        id={ id }
        label={ label }
        value={ value }
        onInput={ setValue }
        onFocus={ onFocus }
        onBlur={ onBlur }
        switcherLabel={ switcherLabel } />
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
