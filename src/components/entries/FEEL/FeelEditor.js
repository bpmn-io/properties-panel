import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { forwardRef } from 'preact/compat';

import FeelEditor from '@bpmn-io/feel-editor';
import { useStaticCallback } from '../../../hooks';

/**
 * Buffer `.focus()` calls while the editor is not initialized.
 * Set Focus inside when the editor is ready.
 */
const useBufferedFocus = function(editor, ref) {

  const [ buffer, setBuffer ] = useState(undefined);

  ref.current = useMemo(() => ({
    focus: (argument) => {
      if (editor) {
        editor.focus(argument);
      } else {
        setBuffer(argument);
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

const CodeEditor = forwardRef((props, ref) => {

  const {
    value,
    onInput,
    onFeelToggle,
    disabled,
    variables
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

    /* Trigger FEEL toggle when
     *
     * - `backspace` is pressed
     * - AND the cursor is at the beginning of the input
     */
    const onKeyDown = e => {
      if (e.key !== 'Backspace' || !editor) {
        return;
      }

      const selection = editor.getSelection();
      const range = selection.ranges[selection.mainIndex];

      if (range.from === 0 && range.to === 0) {
        onFeelToggle();
      }
    };

    editor = new FeelEditor({
      container: inputRef.current,
      onChange: handleInput,
      onKeyDown: onKeyDown,
      value: localValue,
      variables: variables
    });

    setEditor(
      editor
    );

    return () => {
      inputRef.current.innerHTML = '';
      setEditor(null);
    };
  }, [ variables ]);

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


  return <div class={ classNames('bio-properties-panel-feel-editor-container', disabled ? 'disabled' : null) }>
    <div name={ props.name } class={ classNames('bio-properties-panel-input', localValue ? 'edited' : null) } ref={ inputRef }></div>
  </div>;
});

export default CodeEditor;