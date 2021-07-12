import {
  useMemo
} from 'preact/hooks';

function NumberField(props) {

  const {
    debounce,
    disabled,
    id,
    label,
    max,
    min,
    onInput,
    step,
    value = ''
  } = props;

  const handleInput = useMemo(() => {
    return debounce(event => {

      const {
        validity,
        value
      } = event.target;

      if (validity.valid) {
        onInput(value ? parseInt(value, 10) : undefined);
      }
    });
  }, [ onInput, debounce ]);

  return (
    <div class="bio-properties-panel-numberfield">
      <label for={ prefixId(id) } class="bio-properties-panel-label">{ label }</label>
      <input
        id={ prefixId(id) }
        type="number"
        name={ id }
        spellCheck="false"
        autoComplete="off"
        disabled={ disabled }
        class="bio-properties-panel-input"
        max={ max }
        min={ min }
        onInput={ handleInput }
        step={ step }
        value={ value } />
    </div>
  );
}

/**
 * @param {Object} props
 * @param {Boolean} props.debounce
 * @param {String} props.description
 * @param {Boolean} props.disabled
 * @param {Object} props.element
 * @param {Function} props.getValue
 * @param {String} props.id
 * @param {String} props.label
 * @param {String} props.max
 * @param {String} props.min
 * @param {Function} props.setValue
 * @param {String} props.step
 */
export default function NumberFieldEntry(props) {
  const {
    debounce,
    description,
    disabled,
    element,
    getValue,
    id,
    label,
    max,
    min,
    setValue,
    step
  } = props;

  const value = getValue(element);
  return (
    <div class="bio-properties-panel-entry" data-entry-id={ id }>
      <NumberField
        debounce={ debounce }
        disabled={ disabled }
        id={ id }
        label={ label }
        onInput={ setValue }
        max={ max }
        min={ min }
        step={ step }
        value={ value } />
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