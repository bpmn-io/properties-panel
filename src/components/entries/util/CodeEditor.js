import classNames from 'classnames';
import { useEffect, useRef, useState } from 'preact/hooks';

import { FeelEditor } from '@bpmn-io/feel-editor';

export default function CodeEditor(props) {

  const {
    value,
    onInput
  } = props;

  const containerRef = useRef();
  const inputRef = useRef();
  const [editor, setEditor] = useState();
  const [localValue, setLocalValue] = useState((value || '').substring(1));

  const handleInput = newValue => {
    console.log(newValue);
    onInput(newValue);
    setLocalValue(newValue);
  };

  useEffect(() => {
    setEditor(
      new FeelEditor({
        container: inputRef.current,
        onChange: handleInput,
        value: props.value.substring(1)
      })
    );
  }, []);

  useEffect(() => {
    if (!editor) {
      return;
    }

    if (value === localValue) {
      return;
    }

    editor.setValue(localValue);
  }, [ value ]);

  return <div class={ classNames('code-input-container', 'active') } ref={ containerRef }>
    <div class="bio-properties-panel-input" ref={ inputRef }></div>
  </div>;
}