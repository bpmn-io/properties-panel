import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { forwardRef } from 'preact/compat';

import FeelEditor from '@bpmn-io/feel-editor';

import { lineNumbers } from '@codemirror/view';

import { useStaticCallback } from '../../../hooks';

import { ExternalLinkIcon } from '../../icons';


const CodeEditor = forwardRef((props, ref) => {

  const {
    enableGutters,
    value,
    onInput,
    onLint = noop,
    onPopupOpen = noop,
    popupOpen,
    disabled,
    tooltipContainer,
    variables
  } = props;

  const inputRef = useRef();

  const handleInput = useStaticCallback(newValue => {
    onInput(newValue);
  });

  const editor = useEditor({
    container: inputRef.current,
    onChange: handleInput,
    onLint,
    tooltipContainer,
    value,
    variables,
    enableGutters
  });

  // useBufferedFocus(editor, ref);

  const handleClick = () => {

    // ref.current.focus();
  };

  return <div class={ classNames(
    'bio-properties-panel-feel-editor-container',
    disabled ? 'disabled' : null,
    popupOpen ? 'popupOpen' : null)
  }>
    <div class="bio-properties-panel-feel-editor__open-popup-placeholder">Opened in editor</div>
    <div
      name={ props.name }
      class={ classNames('bio-properties-panel-input', value ? 'edited' : null) }
      ref={ inputRef }
      onClick={ handleClick }
      tabIndex={ 0 /** make focussable */ }
    ></div>
    <button
      title="Open pop-up editor"
      class="bio-properties-panel-open-feel-popup"
      onClick={ () => onPopupOpen() }><ExternalLinkIcon /></button>
  </div>;
});

export default CodeEditor;

// helper //////
function useEditor({
  container,
  onChange,
  onLint,
  tooltipContainer,
  value,
  variables,
  enableGutters
}) {
  const editorRef = useRef();

  function _useEditor(fn, deps) {
    useEffect(() => {
      if (!editorRef.current) {
        return;
      }

      return fn(editorRef.current);
    }, [ ...deps, editorRef.current ]);
  }

  useEffect(() => {
    if (!container) {
      return;
    }

    let editor;

    editor = new FeelEditor({
      container,
      onChange,
      onLint,
      tooltipContainer,
      value,
      variables,
      extensions: [
        ...enableGutters ? [ lineNumbers() ] : []
      ]
    });

    editorRef.current = editor;

    return () => {
      onLint([]);
      container.innerHTML = '';
    };
  }, [ container, tooltipContainer, onLint, enableGutters ]);

  _useEditor(editor => {
    editor.setVariables(variables);
  }, [ variables ]);

  _useEditor(editor => {
    editor.setValue(value);
  }, [ value ]);

  return editorRef.current;
}


/**
 * Buffer `.focus()` calls while the editor is not initialized.
 * Set Focus inside when the editor is ready.
 */
function useBufferedFocus(editor, ref) {

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
}

function noop() {}
