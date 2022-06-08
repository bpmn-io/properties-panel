import classNames from 'classnames';
import { useEffect, useRef, useState } from 'preact/hooks';

import FeelEditor from '@bpmn-io/feel-editor';
import { useStaticCallback } from '../../../hooks';

export default function CodeEditor(props) {

  const {
    focus,
    value,
    onInput,
    onDisable
  } = props;

  const containerRef = useRef();
  const inputRef = useRef();
  const [editor, setEditor] = useState();
  const [localValue, setLocalValue] = useState(value || '');

  const handleInput = useStaticCallback(newValue => {
    if (newValue === localValue) {
      return;
    }

    onInput(newValue);
    setLocalValue(newValue);
  });

  useEffect(() => {

    let editor;

    const onKeyDown = e => {
      if (e.key !== 'Backspace' || !editor) {
        return;
      }

      const selection = editor.getSelection();
      const range = selection.ranges[selection.mainIndex];

      if (range.from === 0 && range.to === 0) {
        onDisable();
      }
    };

    editor = new FeelEditor({
      container: inputRef.current,
      onChange: handleInput,
      onKeyDown: onKeyDown,
      value: localValue
    });

    if (focus) {
      editor.focus();
    }

    setEditor(
      editor
    );
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
    if (!focus || !editor) {
      return;
    }

    editor.editor.focus();
  }, [focus, editor]);

  return <div class={ classNames('code-input-container', 'active') } ref={ containerRef }>
    <div class="bio-properties-panel-input" ref={ inputRef }></div>
  </div>;
}