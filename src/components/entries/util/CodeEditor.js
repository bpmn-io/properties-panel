import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { getTokenType, parseFeel } from './CodeEditorUtil';

function highlight(string, node) {
  if (!string) {
    return null;
  }

  if (!node) {
    node = parseFeel(string);
  }

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

  return <>
    <span class={ 'feel-' + getTokenType(node) }>
      {
        orderedTokens.map(token => {
          if (token.type === 'text') {
            return string.slice(token.start, token.end);
          }
          return highlight(string, token);
        })
      }
    </span>
  </>;
}


export default function CodeEditor(props) {

  const {
    value,
    id,
    disabled,
    onInput
  } = props;

  const inputRef = useRef();
  const highlightRef = useRef();
  const [code, setCode] = useState(value || '');

  const handleInput = useMemo(() => e => {
    onInput(e);
    setCode(e.target.value);
  }, [onInput]);

  useEffect(() => {
    const handleScroll = e => {
      console.log('handleScroll', e);
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

  const feelActive = code.startsWith('=');

  return <div class={ classNames('code-input-container', feelActive && 'active') }>
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
      onFocus={ props.onFocus }
      onBlur={ props.onBlur }
      value={ code } />
    <div class="bio-properties-panel-code-highlight" ref={ highlightRef }>
      {feelActive ? <>={highlight(code.slice(1))}</> : code}
    </div>
  </div>;
}
