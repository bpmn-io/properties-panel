import Checkbox from './Checkbox';
import Description from './Description';
import Tooltip from './Tooltip';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.label
 * @param {Array<{label: String, value: *}>} props.options
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {String} [props.description]
 * @param {string|import('preact').Component} [props.tooltip]
 * @param {boolean} [props.disabled]
 * @param {Function} [props.onFocus]
 * @param {Function} [props.onBlur]
 */
export default function CheckboxGroup(props) {
  const {
    element,
    id,
    label,
    description,
    tooltip,
    options = [],
    getValue,
    setValue,
    disabled,
    onFocus,
    onBlur
  } = props;

  const value = getValue(element) || [];

  const handleOptionChange = (optionValue, checked) => {
    const newValue = checked
      ? [ ...value, optionValue ]
      : value.filter(v => v !== optionValue);

    setValue(newValue);
  };

  return (
    <div class="bio-properties-panel-entry bio-properties-panel-checkbox-group" data-entry-id={ id }>
      <div class="bio-properties-panel-group-header">
        <p class="bio-properties-panel-label">
          <Tooltip value={ tooltip } forId={ id } element={ element }>
            { label }
          </Tooltip>
        </p>
      </div>
      <div class="bio-properties-panel-checkbox-group-entries">
        {
          options.map((option) => (
            <Checkbox
              key={ option.value }
              id={ `${id}-${option.value}` }
              label={ option.label }
              setValue={ (checked) => handleOptionChange(option.value, checked) }
              getValue={ () => value.includes(option.value) }
              disabled={ disabled }
              onFocus={ onFocus }
              onBlur={ onBlur }
              element={ element } />
          ))
        }
      </div>
      <Description forId={ id } element={ element } value={ description } />
    </div>
  );
}
