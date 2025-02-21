import {
  useRef,
  useState
} from 'preact/hooks';

import { useTooltipContext } from '../../hooks/useTooltipContext';

import { createPortal } from 'preact/compat';

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
  const SHOW_DELAY = 200;
  let timeout = null;

  const wrapperRef = useRef(null);
  const tooltipRef = useRef(null);

  const show = (_, delay) => {
    if (visible) return;

    if (delay) {
      timeout = setTimeout(() => {
        setVisible(true);
      }, SHOW_DELAY);
    } else {
      setVisible(true);
    }
  };

  const hide = () => {
    clearTimeout(timeout);
    setVisible(false);
  };

  const handleMouseLeave = ({ relatedTarget }) => {

    // Don't hide the tooltip when moving mouse between the wrapper and the tooltip.
    if (relatedTarget === wrapperRef.current || relatedTarget === tooltipRef.current || relatedTarget?.parentElement === tooltipRef.current) {
      return;
    }

    hide();
  };

  const handleFocusOut = (e) => {
    const { target } = e;

    // Don't hide the tooltip if the wrapper or the tooltip itself is clicked.
    const isHovered = target.matches(':hover') || tooltipRef.current?.matches(':hover');

    if (target === wrapperRef.current && isHovered) {
      e.stopPropagation();
      return;
    }

    hide();
  };

  const hideTooltipViaEscape = (e) => {
    e.code === 'Escape' && hide();
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
      onMouseEnter={ (e) => show(e, true) }
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
