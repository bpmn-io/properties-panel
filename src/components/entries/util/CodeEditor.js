import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { parseFeel } from './CodeEditorUtil';
import Typeahead from './Typeahead';


function highlight(context) {
  const {
    renderTree
  } = context;

  function render({ children, content, type, errorText }) {

    return <>
      <span class={ 'feel-' + type } title={ errorText }>
        { content }
        { children && children.map(render) }
      </span>
    </>;
  }


  return <>={render(renderTree)}</>;
}

const createRenderTree = ({ syntaxTree, expression }) => {

  function _createRenderTree(node) {
    const children = node.children;

    if (!children.length) {
      node.content = expression.slice(node.start, node.end);
      return;
    }

    const orderedTokens = children
      .sort((a, b) => a.start - b.start)
      .reduce((acc, current) => {
        const previousEnd = acc[acc.length - 1]?.end || node.start;
        if (current.start > previousEnd) {
          acc.push({
            type: 'text',
            start: previousEnd,
            end: current.start
          });
        }

        acc.push(
          {
            ...current,
            parent: node
          });
        return acc;
      }, []);

    if (orderedTokens[orderedTokens.length - 1].end < node.end) {
      orderedTokens.push({
        start: orderedTokens[orderedTokens.length - 1].end,
        end: node.end,
        type: 'text'
      });
    }

    return orderedTokens.map((token, idx) => {
      if (token.type === 'error') {
        const next = orderedTokens[idx + 1];

        if (token.start !== token.end) {
          token.errorText = 'Unexpected token: ' + expression.slice(token.start, token.end);
        } else if (next) {
          token.errorText = 'Unexpected token: ' + expression.slice(next.start, next.start);
        } else {
          token.errorText = 'Unexpected end of ' + token.parent.name;
        }

      }

      if (token.type === 'text') {
        token.content = expression.slice(token.start, token.end);
      } else {
        token.children = _createRenderTree(token);
      }
      return token;
    });
  }

  const renderTree = {
    type: 'root',
    children: [{ ...syntaxTree }]
  };
  const root = _createRenderTree(renderTree)[0];
  console.log(root);
  return root;
};


export default function CodeEditor(props) {

  const {
    value: persistedValue,
    id,
    disabled,
    onInput,
    variables,
    example = '',
    onFocus = () => {},
    onBlur = () => {},
  } = props;

  const inputRef = useRef();
  const highlightRef = useRef();
  const containerRef = useRef();
  const [value, setValue] = useState(persistedValue || '');
  const [highlighted, setHighlighted] = useState(value);
  const [feelActive, setFeelActive] = useState(persistedValue || '');
  const [autoComplete, setAutoComplete] = useState('');
  const [prediction, setPrediction] = useState({});
  const [syntaxTree, setSyntaxTree] = useState({});
  const [activeNode, setActiveNode] = useState(null);
  const [editingActive, setEditingActive] = useState(false);


  const addPrediction = useMemo(() => ({ renderTree, pointer, event, expression }) => {
    if (event.key && event.key === 'ArrowUp'||
    event.key === 'ArrowDown' ||
    event.key === 'ArrowLeft' ||
    event.key === 'ArrowRight') {
      setAutoComplete('');
      return;
    }

    function _addPridiciton(node) {
      const children = node.children || [];
      for (const i in children) {
        const child = children[i];

        if (child.type === 'variable' && child.end === pointer) {
          const content = child.content;

          const newNode = {
            type: 'prediction',
            search: content,
            originalNode: child,
            content: ''
          };

          // Do code prediction
          const candidate = variables.find(variable => variable.name.startsWith(content));

          if (candidate) {
            newNode.content = candidate.name;

          }
          return newNode;

        }

        const prediction = _addPridiciton(child);
        if (prediction) {
          return prediction;
        }
      }
    }

    let prediction = _addPridiciton(renderTree);


    if (prediction) {
      setPrediction(prediction);
    } else {
      setAutoComplete('');
      setPrediction({});
    }
  }, [variables, example]);

  const handleCodeChanged = useMemo(() => e => {
    const inputField = inputRef.current;

    const carretPostion = inputField.selectionStart;
    const newValue = inputField.value;

    const expression = newValue.slice(1);
    const pointer = carretPostion - 1;

    // remove = sign
    const context = {
      expression,
      pointer,
      event: e
    };

    context.syntaxTree = parseFeel(expression);
    context.renderTree = createRenderTree(context);

    setSyntaxTree(context.syntaxTree);

    setActiveNode(getActiveNode(context.syntaxTree, pointer));

    // add preiction
    addPrediction(context);

    setHighlighted(highlight(context));

    // inputField.focus();
  }, [addPrediction]);

  // const handleAutoComplete = (e) => {
  //   const input = inputRef.current;
  //   const carretPostion = input.selectionStart;
  //   const value = input.value;
  //   const newValue = value.slice(0, carretPostion) + autoComplete + value.slice(carretPostion);
  //   input.value = newValue;
  // };

  const handleKeyDown = e => {
    if (e.key === 'Tab') {
      e.preventDefault();

      if (autoComplete) {
        handleTypeahead(autoComplete);
      } else {

        // Add Tabs
      }

      handleInput(e);
    }

    if (e.key === 'Enter') {

      // Auto-Intent
    }
  };


  const handleKeyUp = e => {
    if (e.key === 'ArrowUp'||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight') {
      handleCodeChanged(e);
    }
  };

  const handleInput = useMemo(() => e => {
    onInput(e);

    const newValue = e.target.value;
    const newFeelActive = newValue.startsWith('=');
    setFeelActive(newFeelActive);
    setValue(newValue);

    if (!newFeelActive) {
      setHighlighted(newValue);
      return;
    }

    handleCodeChanged(e);
  }, [onInput]);

  useEffect(() => {
    const handleScroll = e => {
      const {
        scrollTop,
        scrollLeft
      } = e.target;

      highlightRef.current.style.transform = `translate(-${scrollLeft}px, -${scrollTop}px)`;
    };

    inputRef.current.addEventListener('scroll', handleScroll);
    return () => {
      inputRef.current.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleTypeahead = function(replaceValue) {
    const input = inputRef.current;
    const value = input.value;
    const carretPostion = input.selectionStart;

    let newValue;
    if (prediction.originalNode) {
      newValue = value.slice(0, prediction.originalNode.start + 1) + replaceValue + value.slice(prediction.originalNode.end + 1);
    } else {
      newValue = value.slice(0, carretPostion) + replaceValue + value.slice(carretPostion);
    }

    input.value = newValue;
    setValue(newValue);
    handleCodeChanged({ target: input });
  };

  const handleBlur = function(e) {
    console.log('blur', e, e.relatedTarget);
    onBlur(e);

    setEditingActive(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    container.addEventListener('blur', handleBlur, true);
    return () => container.removeEventListener('blur', handleBlur, true);
  }, [containerRef]);

  const handleFocus = e => {
    onFocus(e);
    handleCodeChanged(e);
    setEditingActive(true);
  };


  return <div class={ classNames('code-input-container', feelActive && 'active') } ref={ containerRef }>
    <div class="codeInputField">
      <input
        ref={ inputRef }
        id={ id }
        type="text"
        name={ id }
        spellCheck="false"
        autoComplete="off"
        disabled={ disabled }
        class="bio-properties-panel-code-input bio-properties-panel-input"
        onInput={ handleInput }
        onClick={ handleCodeChanged }
        onKeyDown={ handleKeyDown }
        onKeyUp={ handleKeyUp }
        onFocus={ handleFocus }

        // onBlur={ handleBlur }
        wrap="off"
        value={ value } />
      <div class="bio-properties-panel-code-highlight" ref={ highlightRef }>
        {highlighted}
      </div>
    </div>
    <Typeahead
      onClick={ handleTypeahead }
      search={ prediction.search }
      feelActive={ feelActive }
      variables={ variables }
      activeNode={ activeNode }
      editingActive={ editingActive }
      setAutoComplete={ setAutoComplete }
    />
  </div>;
}


function getActiveNode(node, caretPostion) {

  console.log('getActiveNode', node, caretPostion);
  if (!node) {
    return;
  }

  const children = node.children || [];

  if (!children.length) {
    return node;
  }

  for (const i in children) {
    const child = children[i];
    if (child.start <= caretPostion && child.end >= caretPostion) {
      return getActiveNode(child, caretPostion);
    }
  }

  return children[children.length - 1];
}