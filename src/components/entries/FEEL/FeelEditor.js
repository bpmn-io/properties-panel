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

  const [ localValue, setLocalValue ] = useState(value || '');
  const isDirtyRef = useRef(false);

  const ignoreProgrammaticChangeRef = useRef(false);
  const editorRef = useRef(null);
  const blurHasCommittedRef = useRef(false);

  const {
    builtins,
    dialect,
    parserDialect
  } = feelLanguageContext || {};

  useBufferedFocus(editor, ref);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.commit = () => {
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
    if (!ignoreProgrammaticChangeRef.current) {
      isDirtyRef.current = useDebounce;
      if (useDebounce) {
        blurHasCommittedRef.current = false;
      }
    }

    onInput(newValue, useDebounce);
    setLocalValue(newValue);
  });

  // Commit immediately on blur
  const handleBlur = useStaticCallback(() => {
    if (!isDirtyRef.current) {
      return;
    }

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

      if (isDirtyRef.current) {

        // Call onInput directly to avoid calling setLocalValue on an unmounted component
        isDirtyRef.current = false;
        onInput(currentValue, false);
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