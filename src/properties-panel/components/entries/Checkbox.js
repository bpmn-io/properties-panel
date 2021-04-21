import {
  useMemo
} from 'preact/hooks';

function Checkbox(props) {
  const {
    id,
    label,
    onChange,
    value = false
  } = props;

  const handleChange = ({ target }) => {
    onChange(target.checked);
  };

  return (
    <div class="bio-properties-panel-checkbox">
      <input id={ prefixId(id) } type="checkbox" class="bio-properties-panel-input" onChange={ handleChange } checked={ value } />
      <label for={ prefixId(id) } class="bio-properties-panel-label">{ label }</label>
    </div>
  );
}

export default function CheckboxEntry(props) {
  const {
    element,
    id,
    label,
    getValue,
    setValue
  } = props;

  const value = useMemo(() => getValue(element), [ getValue(element) ]);

  return (
    <div class="bio-properties-panel-entry">
      <Checkbox id={ id } label={ label } onChange={ setValue } value={ value } />
    </div>
  );
}


// helpers /////////////////

function prefixId(id) {
  return `bio-properties-panel-${ id }`;
}
