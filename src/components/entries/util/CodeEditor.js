import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { parseFeel } from './CodeEditorUtil';


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
    console.log(node);
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

        acc.push(current);
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
          console.log(token);
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
    children: [syntaxTree]
  };
  _createRenderTree(renderTree);

  return renderTree;
};


export default function CodeEditor(props) {

  const {
    value: persistedValue,
    id,
    disabled,
    onInput,
    variables,
    example = ''
  } = props;

  const inputRef = useRef();
  const highlightRef = useRef();
  const [value, setValue] = useState(persistedValue || '');
  const [highlighted, setHighlighted] = useState(value);
  const [feelActive, setFeelActive] = useState(persistedValue || '');
  const [autoComplete, setAutoComplete] = useState('');

  const addPrediction = useMemo(() => ({ renderTree, pointer, event, expression }) => {
    console.log(event);

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

          // Do code prediction
          const candidate = variables.find(variable => variable.name.startsWith(content));

          if (candidate) {
            const newNode = {
              type: 'prediction',
              content: candidate.name.slice(child.end - child.start)
            };

            children.splice(children.indexOf(child) + 1, 0, newNode);

            console.log(children, children.indexOf(child));

            return newNode;
          }
        }

        const prediction = _addPridiciton(child);
        if (prediction) {
          return prediction;
        }
      }
    }

    let prediction = _addPridiciton(renderTree);

    if (!prediction && expression.length === pointer && example.startsWith(expression)) {
      const newNode = {
        type: 'prediction',
        content: example.slice(pointer)
      };

      prediction = newNode;
      !renderTree.children && (renderTree.children = []);
      renderTree.children.push(newNode);
    }



    if (prediction) {
      setAutoComplete(prediction.content);
    } else {
      setAutoComplete('');
    }
  }, [variables, example]);

  const handleCodeChanged = useMemo(() => e => {
    const carretPostion = e.target.selectionStart;
    const newValue = e.target.value;

    const expression = newValue.slice(1);
    const pointer = carretPostion - 1;

    // remove = sign
    const context = {
      expression,
      pointer,
      event: e
    };

    // handleTab
    // handleTab(context);

    context.syntaxTree = parseFeel(expression);
    context.renderTree = createRenderTree(context);

    console.log(context.renderTree);

    // add preiction
    addPrediction(context);

    setHighlighted(highlight(context));
  }, [addPrediction]);

  const handleAutoComplete = (e) => {
    const input = inputRef.current;
    const carretPostion = input.selectionStart;
    const value = input.value;
    const newValue = value.slice(0, carretPostion) + autoComplete + value.slice(carretPostion);
    console.log(autoComplete, newValue);
    input.value = newValue;
  };

  const handleKeyDown = e => {
    if (e.key === 'Tab') {
      e.preventDefault();

      if (autoComplete) {
        handleAutoComplete(e);
      } else {

        // Add Tabs
      }

      handleInput(e);
    }

    if (e.key === 'Enter') {

      // Auto-Intent
    }

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

  return <div class={ classNames('code-input-container', feelActive && 'active') }>
    <textarea
      ref={ inputRef }
      id={ id }
      type="text"
      name={ id }
      spellCheck="false"
      autoComplete="off"
      disabled={ disabled }
      class="bio-properties-panel-code-input bio-properties-panel-input"
      onInput={ handleInput }
      onKeyDown={ handleKeyDown }
      onFocus={ props.onFocus }
      onBlur={ props.onBlur }
      wrap="off"
      value={ value } />
    <div class="bio-properties-panel-code-highlight" ref={ highlightRef }>
      {highlighted}
    </div>
  </div>;
}
