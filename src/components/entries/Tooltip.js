import {
  useRef,
  useState,
  useEffect,
  useLayoutEffect
} from 'preact/hooks';

import { useTooltipContext } from '../../hooks/useTooltipContext';

import { createPortal } from 'preact/compat';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

/**
 * @typedef {Object} TooltipProps
 * @property {Object} [parent] - Parent element ref for portal rendering
 * @property {String} [direction='right'] - Tooltip direction ( 'right', 'top')
 * @property {String} [position] - Custom CSS position override
 * @property {Number} [showDelay=250] - Delay in ms before showing tooltip on hover
 * @property {Number} [hideDelay=250] - Delay in ms before hiding tooltip when mouse leaves, to avoid multiple tooltips from being opened, this should be the same as showDelay
 * @property {*} [children] - Child elements to render inside the tooltip wrapper
 */

/**
 * Tooltip wrapper that provides context-based tooltip content lookup.
 * All props are forwarded to the underlying Tooltip component.
 *
 * @param {TooltipProps & {
 *   forId: String,
 *   value?: String|Object,
 *   element?: Object
 * }} props - Shared tooltip props plus wrapper-specific ones
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

/**
 * @param {TooltipProps & {
 *   forId: String,
 *   value: String|Object
 * }} props
 */
function Tooltip(props) {
  const {
    forId,
    value,
    parent,
    direction = 'right',
    position,
    showDelay = 250,
    hideDelay = 250
  } = props;

  const [ visible, setVisible ] = useState(false);
  const [ tooltipPosition, setTooltipPosition ] = useState(null);
  const [ arrowOffset, setArrowOffset ] = useState(null);

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
      }, showDelay);
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
      }, hideDelay);
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

  useLayoutEffect(() => {
    if (!visible || position) {
      setTooltipPosition(null);
      setArrowOffset(null);
      return;
    }

    if (!wrapperRef.current || !tooltipRef.current) return;

    const { tooltipPosition: newPosition, arrowOffset: newArrowOffset } = getTooltipPosition(wrapperRef.current, tooltipRef.current, direction);
    setTooltipPosition(newPosition);
    setArrowOffset(newArrowOffset);
  }, [ visible, position ]);

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
    const tooltipStyle = position || (tooltipPosition ? `right: ${tooltipPosition.right}; top: ${tooltipPosition.top}px;` : undefined);
    const arrowStyle = arrowOffset != null ? `margin-top: ${arrowOffset }px;` : undefined;

    return (
      <div
        class={ `bio-properties-panel-tooltip ${direction}` }
        role="tooltip"
        id="bio-properties-panel-tooltip"
        aria-labelledby={ forId }
        style={ tooltipStyle }
        ref={ tooltipRef }
        onClick={ (e)=> e.stopPropagation() }
        onMouseEnter={ handleTooltipMouseEnter }
        onMouseLeave={ handleMouseLeave }
      >
        <div class="bio-properties-panel-tooltip-content">
          {value}
        </div>
        <div class="bio-properties-panel-tooltip-arrow" style={ arrowStyle } />
      </div>
    );
  };

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

function getTooltipPosition(refElement, tooltipElement, direction) {
  if (!refElement) {
    return { tooltipPosition: null, arrowOffset: null };
  }

  const refPosition = refElement.getBoundingClientRect();

  const right = `calc(100% - ${refPosition.x}px)`;

  let top = refPosition.top - 10;
  let arrowOffset = null;

  // Ensure that the tooltip is within the viewport, adjust the top position if needed.
  // This is only relevant for the 'right' direction for now
  if (tooltipElement && direction === 'right') {
    const tooltipRect = tooltipElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const minTop = 0;
    const maxTop = viewportHeight - tooltipRect.height;

    const originalTop = top;

    if (top > maxTop) {
      top = maxTop;
    }

    if (top < minTop) {
      top = minTop;
    }

    // Adjust the arrow position if the tooltip had to be moved to stay within viewport
    if (top !== originalTop) {
      const defaultMarginTop = 16;

      const topDiff = top - originalTop;
      arrowOffset = defaultMarginTop - topDiff;
    }
  }

  return {
    tooltipPosition: { right, top },
    arrowOffset
  };
}