import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { forwardRef } from 'preact/compat';

import Editor from '@bpmn-io/feel-editor';

import { EditorView, lineNumbers } from '@codemirror/view';

import { useStaticCallback } from '../../../hooks';

import { OpenPopupButton } from '../../OpenPopupButton';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

const noop = () => {};

/**
 * Buffer `.focus()` calls while the editor is not initialized.
 * Set Focus inside when the editor is ready.
 */
const useBufferedFocus = function(editor, ref) {

  const [ buffer, setBuffer ] = useState(undefined);

  ref.current = useMemo(() => {
    const current = ref.current || {};

    return {
      ...current,
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
    };
  }, [ editor ]);

  useEffect(() => {
    if (typeof buffer !== 'undefined' && editor) {
      editor.focus(buffer);
      setBuffer(false);
    }
  }, [ editor, buffer ]);
};

const FeelEditor = forwardRef((props, ref) => {

  const {
    contentAttributes,
    enableGutters,
    value,
    onInput = noop,
    onKeyDown: onKeyDownProp = noop,
    onFeelToggle = noop,
    onLint = noop,
    onOpenPopup = noop,
    placeholder,
    popupOpen,
    disabled,
    tooltipContainer,
    variables,
    feelLanguageContext
  } = props;

  const inputRef = useRef();
  const [ editor, setEditor ] = useState();
  const editorRef = useRef(null);
  const [ localValue, setLocalValue ] = useState(value || '');
  const isDirtyRef = useRef(false);
  const ignoreProgrammaticChangeRef = useRef(false);

  // Set to true by handleBlur after it commits so that the element-change
  // cleanup in commit() knows it can skip the redundant second commit.
  const blurHasCommittedRef = useRef(false);

  const {
    builtins,
    dialect,
    parserDialect
  } = feelLanguageContext || {};

  useBufferedFocus(editor, ref);

  // Expose commit() and clearDirty() alongside focus() on the ref.
  // commit() is called by the parent (Feel.js) when the element changes so that
  // any pending user input is flushed before the editor is reset to the new
  // element's value.  clearDirty() is called after a toggle to prevent the
  // unmount cleanup from double-committing.
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.commit = () => {

      // blur already flushed the pending input — skip to avoid a double-commit
      // that would cause bpmn-js to steal focus back to the original element.
      if (blurHasCommittedRef.current) {
        blurHasCommittedRef.current = false;
        return;
      }

      const stateValue = editor?._cmEditor?.state?.doc?.toString?.();
      const domValue = editor?._cmEditor?.contentDOM?.textContent;
      const currentValue = stateValue === '' && typeof domValue === 'string'
        ? domValue
        : (stateValue || '');
      isDirtyRef.current = false;
      handleInput(currentValue, false);
    };

    ref.current.clearDirty = () => {
      isDirtyRef.current = false;
    };
  }, [ editor ]);

  const handleInput = useStaticCallback((newValue, useDebounce = true) => {

    // Track whether there is uncommitted user input. Cleared on any direct
    // (non-debounced) commit so the cleanup knows whether to flush on unmount.
    // Ignore changes triggered by our own editor.setValue() calls.
    if (!ignoreProgrammaticChangeRef.current) {
      isDirtyRef.current = useDebounce;
    }

    onInput(newValue, useDebounce);
    setLocalValue(newValue);
  });

  // Commit any pending user input immediately when the CodeMirror editor loses
  // focus. This mirrors what handleOnBlur does for the plain-text input and
  // ensures the debounce is cancelled before focus moves to another element,
  // preventing bpmn-js from stealing focus back after the debounce fires.
  const handleBlur = useStaticCallback(() => {
    if (!isDirtyRef.current) {
      return;
    }

    // Read value directly rather than via ref.current.commit() so we can set
    // blurHasCommittedRef BEFORE the commit call (which may trigger re-renders).
    const currentEditor = editorRef.current;
    const stateValue = currentEditor?._cmEditor?.state?.doc?.toString?.();
    const domValue = currentEditor?._cmEditor?.contentDOM?.textContent;
    const currentValue = stateValue === '' && typeof domValue === 'string'
      ? domValue
      : (stateValue || '');

    blurHasCommittedRef.current = true;
    isDirtyRef.current = false;
    handleInput(currentValue, false);
  });

  useEffect(() => {

    let editor;

    /* Trigger FEEL toggle when
     *
     * - `backspace` is pressed
     * - AND the cursor is at the beginning of the input
     */
    const onKeyDown = e => {

      // Call parent onKeyDown handler first
      onKeyDownProp(e);

      if (e.key !== 'Backspace' || !editor) {
        return;
      }

      const selection = editor.getSelection();
      const range = selection.ranges[selection.mainIndex];

      if (range.from === 0 && range.to === 0) {
        onFeelToggle();
      }
    };

    editor = new Editor({
      container: inputRef.current,
      onChange: handleInput,
      onKeyDown: onKeyDown,
      onLint: onLint,
      placeholder: placeholder,
      tooltipContainer: tooltipContainer,
      value: localValue,
      variables,
      builtins,
      dialect,
      parserDialect,
      extensions: [
        ...enableGutters ? [ lineNumbers() ] : [],
        EditorView.lineWrapping,
        EditorView.domEventHandlers({ blur: handleBlur })
      ],
      contentAttributes
    });

    editorRef.current = editor;
    setEditor(
      editor
    );

    return () => {
      editorRef.current = null;
      const stateValue = editor?._cmEditor?.state?.doc?.toString?.();
      const domValue = editor?._cmEditor?.contentDOM?.textContent;

      const currentValue = stateValue === '' && typeof domValue === 'string'
        ? domValue
        : (stateValue || '');

      // Only commit if the user typed something that hasn't been committed yet.
      // This avoids stale commits during programmatic element changes (undo,
      // type switch) which would cause bpmn-js to steal focus back.
      if (isDirtyRef.current) {
        handleInput(currentValue, false);
      }
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

    ignoreProgrammaticChangeRef.current = true;
    editor.setValue(value);
    ignoreProgrammaticChangeRef.current = false;
    setLocalValue(value);
  }, [ value ]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setVariables(variables);
  }, [ variables ]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setPlaceholder(placeholder);
  }, [ placeholder ]);

  const handleClick = () => {
    ref.current.focus();
  };

  return <div class={ classNames(
    'bio-properties-panel-feel-editor-container',
    disabled ? 'disabled' : null,
    popupOpen ? 'popupOpen' : null)
  }>
    {
      popupOpen && <div class="bio-properties-panel-feel-editor__open-popup-placeholder">Opened in editor</div>
    }
    <div
      name={ props.name }
      class={ classNames('bio-properties-panel-input', localValue ? 'edited' : null) }
      ref={ inputRef }
      onClick={ handleClick }
    ></div>
    {!disabled && <OpenPopupButton
      onClick={ () => onOpenPopup('feel') }
    /> }
  </div>;
});

export default FeelEditor;