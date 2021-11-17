/**
 * @typedef { { value: string, label: string, disabled: boolean } } Option
 */

/**
 * Provides basic select input.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {Function} props.onChange
 * @param {Array<Option>} [props.options]
 * @param {string} props.value
 * @param {boolean} [props.disabled]
 */
function Select(props) {
  const {
    id,
    label,
    onChange,
    options = [],
    value,
    disabled
  } = props;

  const handleChange = ({ target }) => {
    onChange(target.value);
  };

  return (
    <div class="bio-properties-panel-select">
      <label for={ prefixId(id) } class="bio-properties-panel-label">{ label }</label>
      <select
        id={ prefixId(id) }
        name={ id }
        class="bio-properties-panel-input"
        onInput={ handleChange }
        value={ value }
        disabled={ disabled }
      >
        {
          options.map((option, idx) => {
            return (
              <option
                key={ idx }
                value={ option.value }
                disabled={ option.disabled }>
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
 * @param {object} props
 * @param {object} props.element
 * @param {string} props.id
 * @param {string} [props.description]
 * @param {string} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.getOptions
 * @param {boolean} [props.disabled]
 */
export default function SelectEntry(props) {
  const {
    element,
    id,
    description,
    label,
    getValue,
    setValue,
    getOptions,
    disabled
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
        options={ options }
        disabled={ disabled } />
      { description && <div class="bio-properties-panel-description">{ description }</div> }
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
