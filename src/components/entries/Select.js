import classNames from 'classnames';

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

/**
 * @typedef { { value: string, label: string, disabled: boolean } } Option
 */

/**
 * Provides basic select input.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string[]} props.path
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
    disabled,
    show = noop
  } = props;

  const ref = useShowEntryEvent(show);

  const [localValue, setLocalValue] = useState(value);

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
  }, [value]);

  return (
    <div class="bio-properties-panel-select">
      <label for={ prefixId(id) } class="bio-properties-panel-label">{ label }</label>
      <select
        ref={ ref }
        id={ prefixId(id) }
        name={ id }
        class="bio-properties-panel-input"
        onInput={ handleChange }
        value={ localValue }
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
    disabled,
    show = noop
  } = props;

  const value = getValue(element);
  const options = getOptions(element);

  const error = useShowErrorEvent(show);

  return (
    <div
      class={ classNames(
        'bio-properties-panel-entry',
        error ? 'has-error' : '')
      }
      data-entry-id={ id }>
      <Select
        id={ id }
        label={ label }
        value={ value }
        onChange={ setValue }
        options={ options }
        disabled={ disabled }
        show={ show } />
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
