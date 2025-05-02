import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { forwardRef } from 'preact/compat';

import { FeelersEditor } from 'feelers';
import { useStaticCallback } from '../../../hooks';

import { OpenPopupButton } from '../../OpenPopupButton';

const noop = () => {};

/**
 * Buffer `.focus()` calls while the editor is not initialized.
 * Set Focus inside when the editor is ready.
 */
const useBufferedFocus = function(editor, ref) {

  const [ buffer, setBuffer ] = useState(undefined);

  ref.current = useMemo(() => ({
    focus: (offset) => {
      if (editor) {
        editor.focus(offset);
      } else {
        if (typeof offset === 'undefined') {
          offset = Infinity;
        }
        setBuffer(offset);
      }
    }
  }), [ editor ]);

  useEffect(() => {
    if (typeof buffer !== 'undefined' && editor) {
      editor.focus(buffer);
      setBuffer(false);
    }
  }, [ editor, buffer ]);
};

const TemplatingEditor = forwardRef((props, ref) => {

  const {
    onInput,
    disabled,
    tooltipContainer,
    enableGutters,
    value,
    onLint = noop,
    onOpenPopup = noop,
    popupOpen,
    contentAttributes = {},
    hostLanguage = null,
    singleLine = false
  } = props;

  const inputRef = useRef();
  const [ editor, setEditor ] = useState();
  const [ localValue, setLocalValue ] = useState(value || '');

  useBufferedFocus(editor, ref);

  const handleInput = useStaticCallback(newValue => {
    onInput(newValue);
    setLocalValue(newValue);
  });

  useEffect(() => {

    let editor;

    editor = new FeelersEditor({
      container: inputRef.current,
      onChange: handleInput,
      value: localValue,
      onLint,
      contentAttributes,
      tooltipContainer,
      enableGutters,
      hostLanguage,
      singleLine,
      lineWrap: true,
    });

    setEditor(
      editor
    );

    return () => {
      onLint([]);
      inputRef.current.innerHTML = '';
      setEditor(null);
    };
  }, []);

  useEffect(() => {
    if (!editor) {
      return;
    }

    if (value === localValue) {
      return;
    }

    editor.setValue(value);
    setLocalValue(value);
  }, [ value ]);

  const handleClick = () => {
    ref.current.focus();
  };

  return <div class={ classNames(
    'bio-properties-panel-feelers-editor-container',
    popupOpen ? 'popupOpen' : null
  ) }>
    {
      popupOpen && <div class="bio-properties-panel-feelers-editor__popup-placeholder">Opened in popup</div>
    }
    <div
      name={ props.name }
      class={ classNames('bio-properties-panel-feelers-editor bio-properties-panel-input', localValue ? 'edited' : null, disabled ? 'disabled' : null) }
      ref={ inputRef }
      onClick={ handleClick }
    ></div>
    {!disabled && <OpenPopupButton
      onClick={ () => onOpenPopup('feelers') }
    /> }
  </div>;
});

export default TemplatingEditor;