import {
  useEffect,
  useState
} from 'preact/hooks';

import { forwardRef } from 'preact/compat';

import { isFunction } from 'min-dash';

import classNames from 'classnames';

import { useAutoCompletionContext } from '../../hooks';

const AutoCompletionInput = forwardRef((props) => {
  const {
    onInput: _onInput,
    onFocus: _onFocus,
    onBlur: _onBlur,
    onKeydown: _onKeydown,
    value,
    id,
    ...rest
  } = props;

  const [ localValue, setLocalValue ] = useState(value || '');

  const [ dropdownOptions, setDropdownOptions ] = useState([]);
  const [ dropdownOpen, setDropdownOpen ] = useState(false);
  const [ dropdownOptionSelected, setDropdownOptionSelected ] = useState(0);
  const [ isFocused, setIsFocused ] = useState(false);
  const [ hasInput, setHasInput ] = useState(false);

  const openDropdown = () => {
    setDropdownOpen(true);

    setDropdownOptionSelected(Math.max(Math.min(dropdownOptions.length - 1, dropdownOptionSelected), 0));
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
    setHasInput(false);

    setDropdownOptionSelected(0);
  };

  const onInput = event => {
    isFunction(_onInput) && _onInput(event);

    setLocalValue(event.target.value);

    setHasInput(true);
  };

  const onFocus = event => {
    setIsFocused(true);

    isFunction(_onFocus) && _onFocus(event);
  };

  const onBlur = event => {
    setIsFocused(false);

    isFunction(_onBlur) && _onBlur(event);

    setHasInput(false);
  };

  const onKeydown = event => {
    if (dropdownOpen && event.key === 'Escape') {
      closeDropdown();
    } else if (dropdownOpen && event.key === 'ArrowUp') {
      event.preventDefault();

      setDropdownOptionSelected(Math.max(0, dropdownOptionSelected - 1));
    } else if (dropdownOpen && event.key === 'ArrowDown') {
      event.preventDefault();

      setDropdownOptionSelected(Math.min(dropdownOptions.length - 1, dropdownOptionSelected + 1));
    } else if (dropdownOpen && event.key === 'Enter') {
      onInput({ target: { value: dropdownOptions[dropdownOptionSelected].value } });

      closeDropdown();
    } else if (!dropdownOpen && event.key === ' ') {
      event.preventDefault();

      openDropdown();
    }
  };

  const getCompletions = useAutoCompletionContext();

  useEffect(() => {
    if (value === localValue) {
      return;
    }

    setLocalValue(value);
  }, [ value ]);

  useEffect(() => {
    const completions = getCompletions(localValue, id);

    setDropdownOptions(completions);

    if (hasInput && completions.length) {
      openDropdown();
    }
  }, [ hasInput, localValue ]);

  useEffect(() => {
    setDropdownOptionSelected(Math.max(Math.min(dropdownOptions.length - 1, dropdownOptionSelected), 0));
  }, [ dropdownOptions ]);

  useEffect(() => {
    if (!isFocused) {
      closeDropdown();
    }
  }, [ isFocused ]);

  return <div class="bio-properties-panel-textfield-dropdown-wrapper">
    <input
      onInput={ onInput }
      onFocus={ onFocus }
      onBlur={ onBlur }
      onKeydown={ onKeydown }
      value={ localValue }
      id={ prefixId(id) }
      { ...rest } />
    {
      dropdownOpen && !!dropdownOptions.length && <div class={
        classNames('bio-properties-panel-textfield-dropdown', {
          'bio-properties-panel-textfield-dropdown-open': true
        })
      }>
        <ul class="bio-properties-panel-textfield-dropdown-options">
          {
            dropdownOptions.map((option, index) => {
              return <li
                class={
                  classNames('bio-properties-panel-textfield-dropdown-option', {
                    'bio-properties-panel-textfield-dropdown-option-selected': dropdownOptionSelected === index
                  })
                }
                key={ index }
                onClick={ () => onInput({ target: { value: option.value } }) }
              >
                {
                  option.text ? <div class="bio-properties-panel-textfield-dropdown-option-text">{ option.text }</div> : null
                }
                <div class="bio-properties-panel-textfield-dropdown-option-value">{ option.value }</div>
              </li>;
            })
          }
        </ul>
      </div>
    }
  </div>;
});

export default AutoCompletionInput;

function prefixId(id) {
  return `bio-properties-panel-${ id }`;
}