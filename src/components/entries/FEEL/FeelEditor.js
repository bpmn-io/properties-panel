import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { forwardRef } from 'preact/compat';

import FeelEditor from '@bpmn-io/feel-editor';

import { EditorView, lineNumbers } from '@codemirror/view';

import { useStaticCallback } from '../../../hooks';

import { PopupIcon } from '../../icons';

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

const CodeEditor = forwardRef((props, ref) => {

  const {
    enableGutters,
    value,
    onInput,
    onFeelToggle = noop,
    onLint = noop,
    onPopupOpen = noop,
    popupOpen,
    disabled,
    tooltipContainer,
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
      onLint: onLint,
      tooltipContainer: tooltipContainer,
      value: localValue,
      variables: variables,
      extensions: [
        ...enableGutters ? [ lineNumbers() ] : [],
        EditorView.lineWrapping
      ]
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

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setVariables(variables);
  }, [ variables ]);

  const handleClick = () => {
    ref.current.focus();
  };

  return <div class={ classNames(
    'bio-properties-panel-feel-editor-container',
    disabled ? 'disabled' : null,
    popupOpen ? 'popupOpen' : null)
  }>
    <div class="bio-properties-panel-feel-editor__open-popup-placeholder">Opened in editor</div>
    <div
      name={ props.name }
      class={ classNames('bio-properties-panel-input', localValue ? 'edited' : null) }
      ref={ inputRef }
      onClick={ handleClick }
    ></div>
    <button
      type="button"
      title="Open pop-up editor"
      class="bio-properties-panel-open-feel-popup"
      onClick={ () => onPopupOpen() }><PopupIcon /></button>
  </div>;
});

export default CodeEditor;