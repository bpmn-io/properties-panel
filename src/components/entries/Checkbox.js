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

// POC: drive the checkbox visual through the shadcn (Base UI) Checkbox from
// `@camunda/design-system`. Base UI's `<Checkbox.Root>` renders a `<button>`
// for interaction plus a hidden `<input>` next to it, so existing tests that
// query `input[name=...]` still resolve. The label's `htmlFor` points at the
// button (Base UI uses `id` on the button) — a `for=` association on the
// hidden input would not bubble clicks to Base UI's state machine.
import { Checkbox as ShadcnCheckbox } from '@camunda/design-system/preact/components/checkbox';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

function Checkbox(props) {
  const {
    id,
    label,
    onChange,
    disabled,
    value = false,
    onFocus,
    onBlur,
    tooltip
  } = props;

  const [ localValue, setLocalValue ] = useState(!!value);

  const handleCheckedChange = (checked) => {
    onChange(checked);
    setLocalValue(checked);
  };

  useEffect(() => {
    if (!!value === localValue) {
      return;
    }

    setLocalValue(!!value);
  }, [ value ]);

  const ref = useShowEntryEvent(id);

  return (
    <div class="bio-properties-panel-checkbox flex items-center">
      <ShadcnCheckbox
        ref={ ref }
        id={ prefixId(id) }
        name={ id }
        checked={ localValue }
        disabled={ disabled }
        onCheckedChange={ handleCheckedChange }
        onFocus={ onFocus }
        onBlur={ onBlur }
        aria-label={ typeof label === 'string' ? label : undefined }
      />
      <label for={ prefixId(id) } class="bio-properties-panel-label">
        <Tooltip value={ tooltip } forId={ id } element={ props.element }>
          { label }
        </Tooltip>
      </label>
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
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 * @param {string|import('preact').Component} props.tooltip
 * @param {boolean} [props.disabled]
 */
export default function CheckboxEntry(props) {
  const {
    element,
    id,
    description,
    label,
    getValue,
    setValue,
    disabled,
    onFocus,
    onBlur,
    tooltip
  } = props;

  const value = getValue(element);

  const error = useError(id);

  return (
    <div class="bio-properties-panel-entry bio-properties-panel-checkbox-entry" data-entry-id={ id }>
      <Checkbox
        disabled={ disabled }
        id={ id }
        key={ element }
        label={ label }
        onChange={ setValue }
        onFocus={ onFocus }
        onBlur={ onBlur }
        value={ value }
        tooltip={ tooltip }
        element={ element } />
      { error && <div class="bio-properties-panel-error">{ error }</div> }
      <Description forId={ id } element={ element } value={ description } />
    </div>
  );
}

export function isEdited(node) {
  if (!node) return false;

  // Base UI Checkbox renders a <span role="checkbox" aria-checked="...">
  // — `.checked` is undefined on the DOM element. Prefer the aria attribute
  // and fall back to `.checked` for any native <input type="checkbox"> case.
  const aria = node.getAttribute && node.getAttribute('aria-checked');
  if (aria != null) return aria === 'true';

  return !!node.checked;
}


// helpers /////////////////

function prefixId(id) {
  return `bio-properties-panel-${ id }`;
}
