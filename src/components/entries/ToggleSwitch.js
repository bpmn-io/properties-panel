function ToggleSwitch(props) {
  const {
    id,
    label,
    onInput,
    value,
    switcherLabel
  } = props;

  const handleInput = async () => {
    onInput(!value);
  };

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
            name={ id }
            onInput={ handleInput }
            checked={ value } />
          <span class="bio-properties-panel-toggle-switch__slider" />
        </label>
        <p class="bio-properties-panel-toggle-switch__label">{ switcherLabel }</p>
      </div>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {String} props.id
 * @param {String} props.description
 * @param {String} props.label
 * @param {String} props.switcherLabel
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 */
export default function ToggleSwitchEntry(props) {
  const {
    id,
    description,
    label,
    switcherLabel,
    getValue,
    setValue
  } = props;

  const value = getValue();
  return (
    <div class="bio-properties-panel-entry" data-entry-id={ id }>
      <ToggleSwitch id={ id } label={ label } value={ value } onInput={ setValue } switcherLabel={ switcherLabel } />
      { description && <div class="bio-properties-panel-description">{ description }</div> }
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
