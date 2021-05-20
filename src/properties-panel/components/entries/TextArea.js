import {
  useMemo
} from 'preact/hooks';

function TextArea(props) {

  const {
    id,
    label,
    rows = 2,
    debounce,
    onInput,
    value = ''
  } = props;

  const handleInput = useMemo(() => {
    return debounce(({ target }) => onInput(target.value.length ? target.value : undefined));
  }, [ onInput, debounce ]);

  return (
    <div class="bio-properties-panel-textarea">
      <label for={ prefixId(id) } class="bio-properties-panel-label">{ label }</label>
      <textarea
        id={ prefixId(id) }
        name={ id }
        spellCheck="false"
        class="bio-properties-panel-input"
        onInput={ handleInput }
        onFocus={ props.onFocus }
        onBlur={ props.onBlur }
        rows={ rows }
        value={ value } />
    </div>
  );
}

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.description
 * @param {Boolean} props.debounce
 * @param {String} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Number} props.rows
 */
export default function TextAreaEntry(props) {
  const {
    element,
    id,
    description,
    debounce,
    label,
    getValue,
    setValue,
    rows
  } = props;

  const value = getValue(element);
  return (
    <div class="bio-properties-panel-entry" data-entry-id={ id }>
      <TextArea
        id={ id }
        label={ label }
        value={ value }
        onInput={ setValue }
        rows={ rows }
        debounce={ debounce } />
      { description && <div class="bio-properties-panel-description">{ description }</div> }
    </div>
  );
}


// helpers /////////////////

function prefixId(id) {
  return `bio-properties-panel-${ id }`;
}