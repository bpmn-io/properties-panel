import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { getTokenType, parseFeel } from './CodeEditorUtil';


function highlight(context) {
  const {
    renderTree
  } = context;


  function render({ children, content, type }) {

    return <>
      <span class={ 'feel-' + type }>
        { content }
        {
          children && children.map(render)
        }
      </span>
    </>;
  }


  return <>={render(renderTree)}</>;
}

const createRenderTree = ({ syntaxTree, expression }) => {

  function _createRenderTree(node) {
    const children = node.children;
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

    if (!orderedTokens.length) {
      orderedTokens.push(
        {
          start: node.start,
          end: node.end,
          type: 'text'
        }
      );
    }
    else if (orderedTokens[orderedTokens.length - 1].end < node.end) {
      orderedTokens.push({
        start: orderedTokens[orderedTokens.length - 1].end,
        end: node.end,
        type: 'text'
      });
    }

    return orderedTokens.map(token => {
      if (token.type === 'text') {
        token.content = expression.slice(token.start, token.end);
      } else {
        token.children = _createRenderTree(token);
      }
      return token;
    });
  }

  return {
    type: 'root',
    children: _createRenderTree(syntaxTree)
  };
};

export default function CodeEditor(props) {

  const {
    value: persistedValue,
    id,
    disabled,
    onInput,
    variables
  } = props;

  const inputRef = useRef();
  const highlightRef = useRef();
  const [value, setValue] = useState(persistedValue || '');
  const [highlighted, setHighlighted] = useState(value);
  const [feelActive, setFeelActive] = useState(persistedValue || '');
  const carretPostion = inputRef.current?.selectionStart;


  // const addPrediction = ({ tree, pointer }) => {

  //   function _addPridiciton(node) {

  //     const children = node.children;
  //     if (node.type === 'variable' && node.end === pointer) {

  //       // Do code prediction
  //       const candidate = variables.find(variable => variable.name.startsWith(content));

  //       if (candidate) {
  //         children.push({
  //           type: 'prediction',

  //         });

  //         // return <>{ content }<span class="code-prediction">{candidate.name.slice(node.end - node.start)}</span></>;
  //       }
  //     }
  //   }

  //   addPrediction(tree);
  // };

  const handleCodeChanged = (e) => {
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
    // todo

    context.syntaxTree = parseFeel(expression);
    context.renderTree = createRenderTree(context);
    console.log(context);

    // add preiction
    // addPrediction(context);

    setHighlighted(highlight(context));
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
      onFocus={ props.onFocus }
      onBlur={ props.onBlur }
      value={ value } />
    <div class="bio-properties-panel-code-highlight" ref={ highlightRef }>
      {highlighted}
    </div>
  </div>;
}
