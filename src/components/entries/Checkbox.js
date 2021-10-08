function Checkbox(props) {
  const {
    id,
    label,
    onChange,
    value = false
  } = props;

  const handleChange = ({ target }) => {
    onChange(target.checked);
  };

  return (
    <div class="bio-properties-panel-checkbox">
      <input
        id={ prefixId(id) }
        name={ id }
        type="checkbox"
        class="bio-properties-panel-input"
        onChange={ handleChange }
        checked={ value } />
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
 */
export default function CheckboxEntry(props) {
  const {
    element,
    id,
    description,
    label,
    getValue,
    setValue
  } = props;

  const value = getValue(element);

  return (
    <div class="bio-properties-panel-entry bio-properties-panel-checkbox-entry" data-entry-id={ id }>
      <Checkbox id={ id } label={ label } onChange={ setValue } value={ value } />
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
