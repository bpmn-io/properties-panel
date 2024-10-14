import classNames from 'classnames';

import { isFunction } from 'min-dash';

import {
  useError,
  useShowEntryEvent
} from '../../hooks';

import {
  useEffect,
  useState
} from 'preact/hooks';

import Description from './Description';
import Tooltip from './Tooltip';

/**
 * @typedef { { value: string, label: string, disabled: boolean, children: { value: string, label: string, disabled: boolean } } } Option
 */

/**
 * Provides basic select input.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string[]} props.path
 * @param {string} props.label
 * @param {Function} props.onChange
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
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
    value = '',
    disabled,
    onFocus,
    onBlur,
    tooltip
  } = props;

  const ref = useShowEntryEvent(id);

  const [ localValue, setLocalValue ] = useState(value);

  const handleChangeCallback = ({ target }) => {
    onChange(target.value);
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
  }, [ value ]);

  return (
    <div class="bio-properties-panel-select">
      <label for={ prefixId(id) } class="bio-properties-panel-label">
        <Tooltip value={ tooltip } forId={ id } element={ props.element }>
          {label}
        </Tooltip>
      </label>
      <select
        ref={ ref }
        id={ prefixId(id) }
        name={ id }
        class="bio-properties-panel-input"
        onInput={ handleChange }
        onFocus={ onFocus }
        onBlur={ onBlur }
        value={ localValue }
        disabled={ disabled }
      >
        {options.map((option, idx) => {
          if (option.children) {
            return (
              <optgroup key={ idx } label={ option.label }>
                {option.children.map((child, idx) => (
                  <option
                    key={ idx }
                    value={ child.value }
                    disabled={ child.disabled }
                  >
                    {child.label}
                  </option>
                ))}
              </optgroup>
            );
          }

          return (
            <option key={ idx } value={ option.value } disabled={ option.disabled }>
              {option.label}
            </option>
          );
        })}
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
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 * @param {Function} props.getOptions
 * @param {boolean} [props.disabled]
 * @param {Function} [props.validate]
 * @param {string|import('preact').Component} props.tooltip
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
    disabled,
    onFocus,
    onBlur,
    validate,
    tooltip
  } = props;

  const options = getOptions(element);
  const globalError = useError(id);
  const [ localError, setLocalError ] = useState(null);

  let value = getValue(element);

  useEffect(() => {
    if (isFunction(validate)) {
      const newValidationError = validate(value) || null;

      setLocalError(newValidationError);
    }
  }, [ value, validate ]);


  const onChange = (newValue) => {
    let newValidationError = null;

    if (isFunction(validate)) {
      newValidationError = validate(newValue) || null;
    }

    setValue(newValue, newValidationError);
    setLocalError(newValidationError);
  };

  const error = globalError || localError;

  return (
    <div
      class={ classNames(
        'bio-properties-panel-entry',
        error ? 'has-error' : '')
      }
      data-entry-id={ id }>
      <Select
        id={ id }
        key={ element }
        label={ label }
        value={ value }
        onChange={ onChange }
        onFocus={ onFocus }
        onBlur={ onBlur }
        options={ options }
        disabled={ disabled }
        tooltip={ tooltip }
        element={ element } />
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