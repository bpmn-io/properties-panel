import {
  useMemo
} from 'preact/hooks';

import {
  debounce
} from 'min-dash';

function Textfield(props) {

  const {
    debounce: shouldDebounce,
    id,
    label,
    onInput,
    value = ''
  } = props;

  const debouncedOnInput = useMemo(() => shouldDebounce ? debounce(onInput, 300) : onInput,
    [ onInput, shouldDebounce ]);

  const handleInput = ({ target }) => {
    debouncedOnInput(target.value.length ? target.value : undefined);
  };

  return (
    <div class="bio-properties-panel-textfield">
      <label for={ prefixId(id) } class="bio-properties-panel-label">{ label }</label>
      <input
        id={ prefixId(id) }
        type="text"
        spellCheck="false"
        class="bio-properties-panel-input"
        onInput={ handleInput }
        onFocus={ props.onFocus }
        onBlur={ props.onBlur }
        value={ value || '' } />
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
 */
export default function TextfieldEntry(props) {
  const {
    element,
    id,
    description,
    debounce,
    label,
    getValue,
    setValue
  } = props;

  const value = getValue(element);
  return (
    <div class="bio-properties-panel-entry" data-entry-id={ id }>
      <Textfield id={ id } label={ label } value={ value } onInput={ setValue } debounce={ debounce } />
      { description && <div class="bio-properties-panel-description">{ description }</div> }
    </div>
  );
}


// helpers /////////////////

function prefixId(id) {
  return `bio-properties-panel-${ id }`;
}