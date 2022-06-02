import classNames from 'classnames';
import { useEffect, useRef, useState } from 'preact/hooks';

import { FeelEditor } from '@bpmn-io/feel-editor';

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

  const handleInput = newValue => {
    if (newValue === localValue) {
      return;
    }

    onInput(newValue);
    setLocalValue(newValue);
  };

  useEffect(() => {

    let editor;

    const onKeyDown = e => {

      if (e.key !== 'Backspace' || !editor) {
        return;
      }

      const selection = editor.getSelection();

      console.log('selection');
      const range = selection.ranges[selection.mainIndex];

      console.log('range', range);

      if (range.from === 0 && range.to === 0) {

        console.log('disable');
        onDisable();
      }
    };

    editor = new FeelEditor({
      container: inputRef.current,
      onChange: handleInput,
      onKeyDown: onKeyDown,
      value: localValue,
      focus
    });

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