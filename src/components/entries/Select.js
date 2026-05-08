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

import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@camunda/design-system/preact/components/select';

/**
 * @typedef { { value: string, label: string, disabled: boolean, children: { value: string, label: string, disabled: boolean } } } Option
 */

/**
 * Provides basic select input.
 *
 * Renders both a visible shadcn (Base UI) Select for the user-facing UX AND
 * a hidden native `<select>` underneath — the native one preserves the
 * `bio-properties-panel-input` class plus the standard form/event API that
 * downstream tests across the bpmn.io ecosystem rely on
 * (`select[name=...]`, `.value`, `.options`, `changeInput`, etc.).
 *
 * @param {object} props
 * @param {string} props.id
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

  const handleChange = (newValue) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleNativeInput = ({ target }) => {
    handleChange(target.value);
  };

  useEffect(() => {
    if (value === localValue) {
      return;
    }

    setLocalValue(value);
  }, [ value ]);

  // Resolve the human-readable label for the current value so the shadcn
  // trigger renders the same text the native <select> would show.
  const selectedLabel = findOptionLabel(options, localValue);

  return (
    <div class="bio-properties-panel-select">
      <label for={ prefixId(id) } class="bio-properties-panel-label">
        <Tooltip value={ tooltip } forId={ id } element={ props.element }>
          {label}
        </Tooltip>
      </label>

      {/* Visual shadcn Select (button + portal popup). State is shared with
          the hidden native select via `localValue`. */}
      <ShadcnSelect
        value={ localValue }
        onValueChange={ handleChange }
        disabled={ disabled }
      >
        <SelectTrigger aria-label={ typeof label === 'string' ? label : undefined }>
          <SelectValue placeholder=" ">{ selectedLabel }</SelectValue>
        </SelectTrigger>
        <SelectContent>
          { renderShadcnItems(options) }
        </SelectContent>
      </ShadcnSelect>

      {/* Hidden native <select> — preserves the public DOM contract:
          tests / consumers query `select[name=...]` and use the standard
          form API; `changeInput()` fires `input` here and feeds back into
          the same state via `handleNativeInput`. */}
      <select
        ref={ ref }
        id={ prefixId(id) }
        name={ id }
        class="bio-properties-panel-input"
        onInput={ handleNativeInput }
        onFocus={ onFocus }
        onBlur={ onBlur }
        value={ localValue }
        disabled={ disabled }
        tabIndex={ -1 }
        aria-hidden="true"
        style={ { display: 'none' } }
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
    if (newValue !== value) {
      let newValidationError = null;

      if (isFunction(validate)) {
        newValidationError = validate(newValue) || null;
      }

      setValue(newValue, newValidationError);
      setLocalError(newValidationError);
    }
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

function findOptionLabel(options, value) {
  for (const option of options) {
    if (option.children) {
      const child = option.children.find(c => c.value === value);
      if (child) return child.label;
    } else if (option.value === value) {
      return option.label;
    }
  }
  return '';
}

// Flatten optgroup'd options into shadcn <SelectItem>s. Group labels render
// as disabled items so the visual structure is preserved without needing
// Base UI's Group primitives wired through the design system.
function renderShadcnItems(options) {
  return options.map((option, idx) => {
    if (option.children) {
      return [
        <SelectItem key={ `g-${ idx }` } value={ `__group_${ idx }` } disabled>
          { option.label }
        </SelectItem>,
        ...option.children.map((child, cidx) => (
          <SelectItem
            key={ `g-${ idx }-${ cidx }` }
            value={ child.value }
            disabled={ child.disabled }
          >
            { child.label }
          </SelectItem>
        ))
      ];
    }

    return (
      <SelectItem key={ idx } value={ option.value } disabled={ option.disabled }>
        { option.label }
      </SelectItem>
    );
  });
}
