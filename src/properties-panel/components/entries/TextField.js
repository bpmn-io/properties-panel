import {
  useCallback,
  useMemo
} from 'preact/hooks';

import {
  debounce
} from 'min-dash';

function Textfield(props) {

  const {
    id,
    label,
    value = ''
  } = props;

  const debouncedOnInput = useCallback(props.debounce ? debounce(props.onInput, 300) : props.onInput, [ props.onInput ]);

  const onInput = ({ target }) => {
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
        onInput={ onInput }
        onFocus={ props.onFocus }
        onBlur={ props.onBlur }
        value={ value || '' } />
    </div>
  );
}

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

  const value = useMemo(() => getValue(element), [ getValue(element) ]);

  return (
    <div class="bio-properties-panel-entry">
      <Textfield id={ id } label={ label } value={ value } onInput={ setValue } debounce={ debounce } />
      { description && <div class="bio-properties-panel-description">{ description }</div> }
    </div>
  );
}


// helpers /////////////////

function prefixId(id) {
  return `bio-properties-panel-${ id }`;
}