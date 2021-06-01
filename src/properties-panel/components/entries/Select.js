function Select(props) {
  const {
    id,
    label,
    onChange,
    options = [],
    value
  } = props;

  const handleChange = ({ target }) => {
    onChange(target.value);
  };

  return (
    <div class="bio-properties-panel-select">
      <label for={ prefixId(id) } class="bio-properties-panel-label">{ label }</label>
      <select id={ prefixId(id) } name={ id } class="bio-properties-panel-input" onInput={ handleChange }>
        {
          options.map((option) => {
            return (
              <option
                value={ option.value }
                selected={ option.value === value }>
                { option.label }
              </option>
            );
          })
        }
      </select>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} [props.description]
 * @param {String} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.getOptions
 */
export default function SelectEntry(props) {
  const {
    element,
    id,
    description,
    label,
    getValue,
    setValue,
    getOptions
  } = props;

  const value = getValue(element);
  const options = getOptions(element);

  return (
    <div class="bio-properties-panel-entry" data-entry-id={ id }>
      <Select
        id={ id }
        label={ label }
        value={ value }
        onChange={ setValue }
        options={ options } />
      { description && <div class="bio-properties-panel-description">{ description }</div> }
    </div>
  );
}


// helpers /////////////////

function prefixId(id) {
  return `bio-properties-panel-${ id }`;
}
