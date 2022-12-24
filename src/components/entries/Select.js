import classNames from 'classnames';

import {
  useError,
  useShowEntryEvent
} from '../../hooks';

import {
  useEffect,
  useState
} from 'preact/hooks';

import Description from './Description';

/**
 * @typedef { { value: string, label: string, disabled: boolean, groupKey: (string|undefined) } } Option
 * @typedef { { key: string, label: string } } OptionGroup
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
 * @param {Array<OptionGroup>} [props.groups]
 */
function Select(props) {
  const {
    id,
    label,
    onChange,
    options = [],
    groups = [],
    value = '',
    disabled,
    onFocus,
    onBlur
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
        {label}
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
        {groups.map((group, idx) => (
          <optgroup key={ idx } label={ group.label }>
            {options
              .filter((option) => option.groupKey === group.key)
              .map((option, idx) => (
                <option
                  key={ idx }
                  value={ option.name }
                  disabled={ option.disabled }
                >
                  {option.label}
                </option>
              ))}
          </optgroup>
        ))}

        {options
          .filter((option) => !option.groupKey)
          .map((option, idx) => {
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
 * @param {Function} [props.getGroups]
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
    getGroups,
    disabled,
    onFocus,
    onBlur
  } = props;

  const value = getValue(element);
  const options = getOptions(element);
  let groups;

  if (getGroups) {
    groups = getGroups(element);
  }

  const error = useError(id);

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
        onChange={ setValue }
        onFocus={ onFocus }
        onBlur={ onBlur }
        options={ options }
        groups={ groups }
        disabled={ disabled } />
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
