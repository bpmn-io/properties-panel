import {
  useRef,
  useState,
  useEffect
} from 'preact/hooks';

import { useTooltipContext } from '../../hooks/useTooltipContext';

import { createPortal } from 'preact/compat';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

/**
 * @param {Object} props
 * @param {String} props.forId
 * @param {String} props.value
 */
export default function TooltipWrapper(props) {
  const {
    forId,
    element
  } = props;

  const contextDescription = useTooltipContext(forId, element);

  const value = props.value || contextDescription;

  if (!value) {
    return props.children;
  }

  return <Tooltip { ...props } value={ value } forId={ `bio-properties-panel-${ forId }` } />;
}

function Tooltip(props) {
  const {
    forId,
    value,
    parent,
    direction = 'right',
    position
  } = props;

  const [ visible, setVisible ] = useState(false);

  // Tooltip will be shown after SHOW_DELAY ms from hovering over the source element.
  const SHOW_DELAY = 250;

  // Tooltip will be hidden after HIDE_DELAY ms leaving the source element or tooltip.
  const HIDE_DELAY = SHOW_DELAY; // to not show double tooltips, those should be the same

  const showTimeoutRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  const wrapperRef = useRef(null);
  const tooltipRef = useRef(null);

  const show = (_, delay) => {
    clearTimeout(showTimeoutRef.current);
    clearTimeout(hideTimeoutRef.current);

    if (visible) return;

    if (delay) {
      showTimeoutRef.current = setTimeout(() => {
        setVisible(true);
      }, SHOW_DELAY);
    } else {
      setVisible(true);
    }
  };

  const handleWrapperMouseEnter = (e) => {
    show(e, true);
  };

  const hide = (delay = false) => {
    clearTimeout(showTimeoutRef.current);
    clearTimeout(hideTimeoutRef.current);

    if (delay) {
      hideTimeoutRef.current = setTimeout(() => {
        setVisible(false);
      }, HIDE_DELAY);
    } else {
      setVisible(false);
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearTimeout(showTimeoutRef.current);
      clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Handle click outside to close tooltip for non-focusable elements
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (e) => {

      // If clicking outside both the wrapper and tooltip, hide it
      if (wrapperRef.current && !wrapperRef.current.contains(e.target) &&
          tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        hide(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ visible, hide ]);

  const handleMouseLeave = ({ relatedTarget }) => {

    // Don't hide the tooltip when moving mouse between the wrapper and the tooltip.
    if (relatedTarget === wrapperRef.current || relatedTarget === tooltipRef.current || relatedTarget?.parentElement === tooltipRef.current) {
      return;
    }

    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {

      // Check if selection is within tooltip content
      const selectionRange = selection.getRangeAt(0);
      if (tooltipRef.current?.contains(selectionRange.commonAncestorContainer) ||
          tooltipRef.current?.contains(selection.anchorNode) ||
          tooltipRef.current?.contains(selection.focusNode)) {
        return; // Keep tooltip open during text selection
      }
    }

    hide(true);
  };

  const handleTooltipMouseEnter = () => {
    clearTimeout(hideTimeoutRef.current);
  };

  const handleFocusOut = (e) => {
    const { relatedTarget } = e;

    // Don't hide if focus moved to the tooltip or another element within the wrapper
    if (tooltipRef.current?.contains(relatedTarget) ||
        wrapperRef.current?.contains(relatedTarget)) {
      return;
    }

    hide(false);
  };

  const hideTooltipViaEscape = (e) => {
    e.code === 'Escape' && hide(false);
  };

  const renderTooltip = () => {
    return (
      <div
        class={ `bio-properties-panel-tooltip ${direction}` }
        role="tooltip"
        id="bio-properties-panel-tooltip"
        aria-labelledby={ forId }
        style={ position || getTooltipPosition(wrapperRef.current) }
        ref={ tooltipRef }
        onClick={ (e)=> e.stopPropagation() }
        onMouseEnter={ handleTooltipMouseEnter }
        onMouseLeave={ handleMouseLeave }
      >
        <div class="bio-properties-panel-tooltip-content">
          {value}
        </div>
        <div class="bio-properties-panel-tooltip-arrow" />
      </div>
    );};

  return (
    <div class="bio-properties-panel-tooltip-wrapper" tabIndex="0"
      ref={ wrapperRef }
      onMouseEnter={ handleWrapperMouseEnter }
      onMouseLeave={ handleMouseLeave }
      onFocus={ show }
      onBlur={ handleFocusOut }
      onKeyDown={ hideTooltipViaEscape }
    >
      {props.children}
      {visible ?
        (parent ?
          createPortal(renderTooltip(), parent.current)
          : renderTooltip()
        ) : null
      }
    </div>
  );
}


// helper

function getTooltipPosition(refElement) {
  const refPosition = refElement.getBoundingClientRect();

  const right = `calc(100% - ${refPosition.x}px)`;
  const top = `${refPosition.top - 10}px`;

  return `right: ${right}; top: ${top};`;
}
