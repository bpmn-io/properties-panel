import {
  useRef,
  useEffect,
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

  return <Tooltip { ...props } value={ value } forId={ prefixId(forId) } />;
}

function Tooltip(props) {
  const {
    forId,
    value,
    parent,
    direction = 'right',
    position
  } = props;

  const [ visible, setShow ] = useState(false);
  const [ focusedViaKeyboard, setFocusedViaKeyboard ] = useState(false);

  let timeout = null;

  const wrapperRef = useRef(null);
  const tooltipRef = useRef(null);

  const showTooltip = async (event) => {
    const show = () => setShow(true);

    if (!visible && !timeout) {
      if (event instanceof MouseEvent) {
        timeout = setTimeout(show, 200);
      } else {
        show();
        setFocusedViaKeyboard(true);
      }
    }
  };

  const hideTooltip = () => {
    setShow(false);
    setFocusedViaKeyboard(false);
  };

  const hideTooltipViaEscape = (e) => {
    e.code === 'Escape' && hideTooltip();
  };

  const isTooltipHovered = ({ x, y }) => {
    const tooltip = tooltipRef.current;
    const wrapper = wrapperRef.current;

    return tooltip && (
      inBounds(x, y, wrapper.getBoundingClientRect()) ||
      inBounds(x, y, tooltip.getBoundingClientRect())
    );
  };

  useEffect(() => {
    const { current } = wrapperRef;

    if (!current) {
      return;
    }

    const hideHoveredTooltip = (e) => {
      const isFocused = document.activeElement === wrapperRef.current
                        || document.activeElement.closest('.bio-properties-panel-tooltip');

      if (visible && !isTooltipHovered({ x: e.x, y: e.y }) && !(isFocused && focusedViaKeyboard)) {
        hideTooltip();
      }
    };

    const hideFocusedTooltip = (e) => {
      const { relatedTarget } = e;
      const isTooltipChild = (el) => !!el.closest('.bio-properties-panel-tooltip');


      if (visible && !isHovered(wrapperRef.current) && relatedTarget && !isTooltipChild(relatedTarget)) {
        hideTooltip();
      }
    };

    document.addEventListener('wheel', hideHoveredTooltip);
    document.addEventListener('focusout', hideFocusedTooltip);
    document.addEventListener('mousemove', hideHoveredTooltip);

    return () => {
      document.removeEventListener('wheel', hideHoveredTooltip);
      document.removeEventListener('mousemove', hideHoveredTooltip);
      document.removeEventListener('focusout', hideFocusedTooltip);
    };
  }, [ wrapperRef.current, visible, focusedViaKeyboard ]);

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
      onMouseEnter={ showTooltip }
      onMouseLeave={ ()=> {
        clearTimeout(timeout);
        timeout = null;
      } }
      onFocus={ showTooltip }
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
function inBounds(x, y, bounds) {
  const { top, right, bottom, left } = bounds;
  return x >= left && x <= right && y >= top && y <= bottom;
}

function getTooltipPosition(refElement) {
  const refPosition = refElement.getBoundingClientRect();

  const right = `calc(100% - ${refPosition.x}px)`;
  const top = `${refPosition.top - 10}px`;

  return `right: ${right}; top: ${top};`;
}

function isHovered(element) {
  return element.matches(':hover');
}

function prefixId(id) {
  return `bio-properties-panel-${ id }`;
}
