import { useContext, useState, useRef, useEffect, useMemo, useCallback, useLayoutEffect } from '../preact/hooks';
import { isFunction, isString, isArray, get, assign, set, sortBy, find, isNumber, debounce } from 'min-dash';
import { createPortal, forwardRef } from '../preact/compat';
import { jsx, jsxs, Fragment } from '../preact/jsx-runtime';
import { createContext, createElement } from '../preact';
import classnames from 'classnames';
import { query, domify } from 'min-dom';
import { FeelersEditor } from 'feelers';
import FeelEditor from '@bpmn-io/feel-editor';
import { lineNumbers } from '@codemirror/view';
import * as focusTrap from 'focus-trap';

var ArrowIcon = function ArrowIcon(props) {
  return jsx("svg", {
    ...props,
    children: jsx("path", {
      fillRule: "evenodd",
      d: "m11.657 8-4.95 4.95a1 1 0 0 1-1.414-1.414L8.828 8 5.293 4.464A1 1 0 1 1 6.707 3.05L11.657 8Z"
    })
  });
};
ArrowIcon.defaultProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "16",
  height: "16"
};
var CreateIcon = function CreateIcon(props) {
  return jsx("svg", {
    ...props,
    children: jsx("path", {
      fillRule: "evenodd",
      d: "M9 13V9h4a1 1 0 0 0 0-2H9V3a1 1 0 1 0-2 0v4H3a1 1 0 1 0 0 2h4v4a1 1 0 0 0 2 0Z"
    })
  });
};
CreateIcon.defaultProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "16",
  height: "16"
};
var DeleteIcon = function DeleteIcon(props) {
  return jsx("svg", {
    ...props,
    children: jsx("path", {
      fillRule: "evenodd",
      d: "M12 6v7c0 1.1-.4 1.55-1.5 1.55h-5C4.4 14.55 4 14.1 4 13V6h8Zm-1.5 1.5h-5v4.3c0 .66.5 1.2 1.111 1.2H9.39c.611 0 1.111-.54 1.111-1.2V7.5ZM13 3h-2l-1-1H6L5 3H3v1.5h10V3Z"
    })
  });
};
DeleteIcon.defaultProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "16",
  height: "16"
};
var DragIcon = function DragIcon(props) {
  return jsxs("svg", {
    ...props,
    children: [jsx("path", {
      fill: "#fff",
      style: {
        mixBlendMode: "multiply"
      },
      d: "M0 0h16v16H0z"
    }), jsx("path", {
      fill: "#fff",
      style: {
        mixBlendMode: "multiply"
      },
      d: "M0 0h16v16H0z"
    }), jsx("path", {
      d: "M7 3H5v2h2V3zm4 0H9v2h2V3zM7 7H5v2h2V7zm4 0H9v2h2V7zm-4 4H5v2h2v-2zm4 0H9v2h2v-2z",
      fill: "#161616"
    })]
  });
};
DragIcon.defaultProps = {
  width: "16",
  height: "16",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
};
var ExternalLinkIcon = function ExternalLinkIcon(props) {
  return jsx("svg", {
    ...props,
    children: jsx("path", {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M12.637 12.637v-4.72h1.362v4.721c0 .36-.137.676-.411.95-.275.275-.591.412-.95.412H3.362c-.38 0-.703-.132-.967-.396A1.315 1.315 0 0 1 2 12.638V3.362c0-.38.132-.703.396-.967S2.982 2 3.363 2h4.553v1.363H3.363v9.274h9.274ZM14 2H9.28l-.001 1.362h2.408L5.065 9.984l.95.95 6.622-6.622v2.409H14V2Z",
      fill: "currentcolor"
    })
  });
};
ExternalLinkIcon.defaultProps = {
  width: "16",
  height: "16",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
};
var FeelIcon$1 = function FeelIcon(props) {
  return jsx("svg", {
    ...props,
    children: jsx("path", {
      d: "M3.617 11.99c-.137.684-.392 1.19-.765 1.518-.362.328-.882.492-1.558.492H0l.309-1.579h1.264l1.515-7.64h-.912l.309-1.579h.911l.236-1.191c.137-.685.387-1.192.75-1.52C4.753.164 5.277 0 5.953 0h1.294L6.94 1.579H5.675l-.323 1.623h1.264l-.309 1.579H5.043l-1.426 7.208ZM5.605 11.021l3.029-4.155L7.28 3.202h2.073l.706 2.547h.176l1.691-2.547H14l-3.014 4.051 1.338 3.768H10.25l-.706-2.606H9.37L7.678 11.02H5.605Z",
      fill: "currentcolor"
    })
  });
};
FeelIcon$1.defaultProps = {
  width: "14",
  height: "14",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
};
var HelpIcon = function HelpIcon(props) {
  return jsxs("svg", {
    ...props,
    children: [jsx("path", {
      d: "M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2Zm0 26a12 12 0 1 1 12-12 12 12 0 0 1-12 12Z"
    }), jsx("circle", {
      cx: "16",
      cy: "23.5",
      r: "1.5"
    }), jsx("path", {
      d: "M17 8h-1.5a4.49 4.49 0 0 0-4.5 4.5v.5h2v-.5a2.5 2.5 0 0 1 2.5-2.5H17a2.5 2.5 0 0 1 0 5h-2v4.5h2V17a4.5 4.5 0 0 0 0-9Z"
    }), jsx("path", {
      style: {
        fill: "none"
      },
      d: "M0 0h32v32H0z"
    })]
  });
};
HelpIcon.defaultProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 32"
};
var PopupIcon = function PopupIcon(props) {
  return jsx("svg", {
    ...props,
    children: jsx("path", {
      stroke: "currentColor",
      d: "M20 2v2h6.586L18 12.582 19.414 14 28 5.414V12h2V2H20zM14 19.416 12.592 18 4 26.586V20H2v10h10v-2H5.414L14 19.416z"
    })
  });
};
PopupIcon.defaultProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "16",
  height: "16",
  viewBox: "0 0 32 32"
};

function Header(props) {
  const {
    element,
    headerProvider
  } = props;
  const {
    getElementIcon,
    getDocumentationRef,
    getElementLabel,
    getTypeLabel
  } = headerProvider;
  const label = getElementLabel(element);
  const type = getTypeLabel(element);
  const documentationRef = getDocumentationRef && getDocumentationRef(element);
  const ElementIcon = getElementIcon(element);
  return jsxs("div", {
    class: "bio-properties-panel-header",
    children: [jsx("div", {
      class: "bio-properties-panel-header-icon",
      children: ElementIcon && jsx(ElementIcon, {
        width: "32",
        height: "32",
        viewBox: "0 0 32 32"
      })
    }), jsxs("div", {
      class: "bio-properties-panel-header-labels",
      children: [jsx("div", {
        title: type,
        class: "bio-properties-panel-header-type",
        children: type
      }), label ? jsx("div", {
        title: label,
        class: "bio-properties-panel-header-label",
        children: label
      }) : null]
    }), jsx("div", {
      class: "bio-properties-panel-header-actions",
      children: documentationRef ? jsx("a", {
        rel: "noopener",
        class: "bio-properties-panel-header-link",
        href: documentationRef,
        title: "Open documentation",
        target: "_blank",
        children: jsx(ExternalLinkIcon, {})
      }) : null
    })]
  });
}

const DescriptionContext = createContext({
  description: {},
  getDescriptionForId: () => {}
});

const ErrorsContext = createContext({
  errors: {}
});

/**
 * @typedef {Function} <propertiesPanel.showEntry> callback
 *
 * @example
 *
 * useEvent('propertiesPanel.showEntry', ({ focus = false, ...rest }) => {
 *   // ...
 * });
 *
 * @param {Object} context
 * @param {boolean} [context.focus]
 *
 * @returns void
 */

const EventContext = createContext({
  eventBus: null
});

const LayoutContext = createContext({
  layout: {},
  setLayout: () => {},
  getLayoutForKey: () => {},
  setLayoutForKey: () => {}
});

const TooltipContext = createContext({
  tooltip: {},
  getTooltipForId: () => {}
});

/**
 * Accesses the global TooltipContext and returns a tooltip for a given id and element.
 *
 * @example
 * ```jsx
 * function TextField(props) {
 *   const tooltip = useTooltipContext('input1', element);
 * }
 * ```
 *
 * @param {string} id
 * @param {object} element
 *
 * @returns {string}
 */
function useTooltipContext(id, element) {
  const {
    getTooltipForId
  } = useContext(TooltipContext);
  return getTooltipForId(id, element);
}

function TooltipWrapper(props) {
  const {
    forId,
    element
  } = props;
  const contextDescription = useTooltipContext(forId, element);
  const value = props.value || contextDescription;
  if (!value) {
    return props.children;
  }
  return jsx(Tooltip, {
    ...props,
    value: value,
    forId: prefixId$9(forId)
  });
}
function Tooltip(props) {
  const {
    forId,
    value,
    parent
  } = props;
  const [visible, setShow] = useState(false);
  const [focusedViaKeyboard, setFocusedViaKeyboard] = useState(false);
  let timeout = null;
  const wrapperRef = useRef(null);
  const tooltipRef = useRef(null);
  const showTooltip = async event => {
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
  const hideTooltipViaEscape = e => {
    e.code === 'Escape' && hideTooltip();
  };
  const isTooltipHovered = ({
    x,
    y
  }) => {
    const tooltip = tooltipRef.current;
    const wrapper = wrapperRef.current;
    return tooltip && (inBounds(x, y, wrapper.getBoundingClientRect()) || inBounds(x, y, tooltip.getBoundingClientRect()));
  };
  useEffect(() => {
    const {
      current
    } = wrapperRef;
    if (!current) {
      return;
    }
    const hideHoveredTooltip = e => {
      const isFocused = document.activeElement === wrapperRef.current || document.activeElement.closest('.bio-properties-panel-tooltip');
      if (visible && !isTooltipHovered({
        x: e.x,
        y: e.y
      }) && !(isFocused && focusedViaKeyboard)) {
        hideTooltip();
      }
    };
    const hideFocusedTooltip = e => {
      const {
        relatedTarget
      } = e;
      const isTooltipChild = el => !!el.closest('.bio-properties-panel-tooltip');
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
  }, [wrapperRef.current, visible, focusedViaKeyboard]);
  const renderTooltip = () => {
    return jsxs("div", {
      class: "bio-properties-panel-tooltip",
      role: "tooltip",
      id: "bio-properties-panel-tooltip",
      "aria-labelledby": forId,
      style: getTooltipPosition(wrapperRef.current),
      ref: tooltipRef,
      onClick: e => e.stopPropagation(),
      children: [jsx("div", {
        class: "bio-properties-panel-tooltip-content",
        children: value
      }), jsx("div", {
        class: "bio-properties-panel-tooltip-arrow"
      })]
    });
  };
  return jsxs("div", {
    class: "bio-properties-panel-tooltip-wrapper",
    tabIndex: "0",
    ref: wrapperRef,
    onMouseEnter: showTooltip,
    onMouseLeave: () => {
      clearTimeout(timeout);
      timeout = null;
    },
    onFocus: showTooltip,
    onKeyDown: hideTooltipViaEscape,
    children: [props.children, visible ? parent ? createPortal(renderTooltip(), parent.current) : renderTooltip() : null]
  });
}

// helper
function inBounds(x, y, bounds) {
  const {
    top,
    right,
    bottom,
    left
  } = bounds;
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
function prefixId$9(id) {
  return `bio-properties-panel-${id}`;
}

/**
 * Accesses the global DescriptionContext and returns a description for a given id and element.
 *
 * @example
 * ```jsx
 * function TextField(props) {
 *   const description = useDescriptionContext('input1', element);
 * }
 * ```
 *
 * @param {string} id
 * @param {object} element
 *
 * @returns {string}
 */
function useDescriptionContext(id, element) {
  const {
    getDescriptionForId
  } = useContext(DescriptionContext);
  return getDescriptionForId(id, element);
}

function useError(id) {
  const {
    errors
  } = useContext(ErrorsContext);
  return errors[id];
}
function useErrors() {
  const {
    errors
  } = useContext(ErrorsContext);
  return errors;
}

/**
 * Subscribe to an event immediately. Update subscription after inputs changed.
 *
 * @param {string} event
 * @param {Function} callback
 */
function useEvent(event, callback, eventBus) {
  const eventContext = useContext(EventContext);
  if (!eventBus) {
    ({
      eventBus
    } = eventContext);
  }
  const didMount = useRef(false);

  // (1) subscribe immediately
  if (eventBus && !didMount.current) {
    eventBus.on(event, callback);
  }

  // (2) update subscription after inputs changed
  useEffect(() => {
    if (eventBus && didMount.current) {
      eventBus.on(event, callback);
    }
    didMount.current = true;
    return () => {
      if (eventBus) {
        eventBus.off(event, callback);
      }
    };
  }, [callback, event, eventBus]);
}

const KEY_LENGTH = 6;

/**
 * Create a persistent key factory for plain objects without id.
 *
 * @example
 * ```jsx
 * function List({ objects }) {
 *   const getKey = useKeyFactory();
 *   return (<ol>{
 *     objects.map(obj => {
 *       const key = getKey(obj);
 *       return <li key={key}>obj.name</li>
 *     })
 *   }</ol>);
 * }
 * ```
 *
 * @param {any[]} dependencies
 * @returns {(element: object) => string}
 */
function useKeyFactory(dependencies = []) {
  const map = useMemo(() => new Map(), dependencies);
  const getKey = el => {
    let key = map.get(el);
    if (!key) {
      key = Math.random().toString().slice(-KEY_LENGTH);
      map.set(el, key);
    }
    return key;
  };
  return getKey;
}

/**
 * Creates a state that persists in the global LayoutContext.
 *
 * @example
 * ```jsx
 * function Group(props) {
 *   const [ open, setOpen ] = useLayoutState([ 'groups', 'foo', 'open' ], false);
 * }
 * ```
 *
 * @param {(string|number)[]} path
 * @param {any} [defaultValue]
 *
 * @returns {[ any, Function ]}
 */
function useLayoutState(path, defaultValue) {
  const {
    getLayoutForKey,
    setLayoutForKey
  } = useContext(LayoutContext);
  const layoutForKey = getLayoutForKey(path, defaultValue);
  const setState = useCallback(newValue => {
    setLayoutForKey(path, newValue);
  }, [setLayoutForKey]);
  return [layoutForKey, setState];
}

/**
 * @pinussilvestrus: we need to introduce our own hook to persist the previous
 * state on updates.
 *
 * cf. https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
 */

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

/**
 * Subscribe to `propertiesPanel.showEntry`.
 *
 * @param {string} id
 *
 * @returns {import('preact').Ref}
 */
function useShowEntryEvent(id) {
  const {
    onShow
  } = useContext(LayoutContext);
  const ref = useRef();
  const focus = useRef(false);
  const onShowEntry = useCallback(event => {
    if (event.id === id) {
      onShow();
      if (!focus.current) {
        focus.current = true;
      }
    }
  }, [id]);
  useEffect(() => {
    if (focus.current && ref.current) {
      if (isFunction(ref.current.focus)) {
        ref.current.focus();
      }
      if (isFunction(ref.current.select)) {
        ref.current.select();
      }
      focus.current = false;
    }
  });
  useEvent('propertiesPanel.showEntry', onShowEntry);
  return ref;
}

/**
 * @callback setSticky
 * @param {boolean} value
 */

/**
 * Use IntersectionObserver to identify when DOM element is in sticky mode.
 * If sticky is observered setSticky(true) will be called.
 * If sticky mode is left, setSticky(false) will be called.
 *
 *
 * @param {Object} ref
 * @param {string} scrollContainerSelector
 * @param {setSticky} setSticky
 */
function useStickyIntersectionObserver(ref, scrollContainerSelector, setSticky) {
  const [scrollContainer, setScrollContainer] = useState(query(scrollContainerSelector));
  const updateScrollContainer = useCallback(() => {
    const newScrollContainer = query(scrollContainerSelector);
    if (newScrollContainer !== scrollContainer) {
      setScrollContainer(newScrollContainer);
    }
  }, [scrollContainerSelector, scrollContainer]);
  useEffect(() => {
    updateScrollContainer();
  }, [updateScrollContainer]);
  useEvent('propertiesPanel.attach', updateScrollContainer);
  useEvent('propertiesPanel.detach', updateScrollContainer);
  useEffect(() => {
    const Observer = IntersectionObserver;

    // return early if IntersectionObserver is not available
    if (!Observer) {
      return;
    }

    // TODO(@barmac): test this
    if (!ref.current || !scrollContainer) {
      return;
    }
    const observer = new Observer(entries => {
      // scroll container is unmounted, do not update sticky state
      if (scrollContainer.scrollHeight === 0) {
        return;
      }
      entries.forEach(entry => {
        if (entry.intersectionRatio < 1) {
          setSticky(true);
        } else if (entry.intersectionRatio === 1) {
          setSticky(false);
        }
      });
    }, {
      root: scrollContainer,
      rootMargin: '0px 0px 999999% 0px',
      // Use bottom margin to avoid stickyness when scrolling out to bottom
      threshold: [1]
    });
    observer.observe(ref.current);

    // Unobserve if unmounted
    return () => {
      observer.unobserve(ref.current);
    };
  }, [ref.current, scrollContainer, setSticky]);
}

/**
 * Creates a static function reference with changing body.
 * This is necessary when external libraries require a callback function
 * that has references to state variables.
 *
 * Usage:
 * const callback = useStaticCallback((val) => {val === currentState});
 *
 * The `callback` reference is static and can be safely used in external
 * libraries or as a prop that does not cause rerendering of children.
 *
 * @param {Function} callback function with changing reference
 * @returns {Function} static function reference
 */
function useStaticCallback(callback) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  return useCallback((...args) => callbackRef.current(...args), []);
}

function Group(props) {
  const {
    element,
    entries = [],
    id,
    label,
    shouldOpen = false
  } = props;
  const groupRef = useRef(null);
  const [open, setOpen] = useLayoutState(['groups', id, 'open'], shouldOpen);
  const onShow = useCallback(() => setOpen(true), [setOpen]);
  const toggleOpen = () => setOpen(!open);
  const [edited, setEdited] = useState(false);
  const [sticky, setSticky] = useState(false);

  // set edited state depending on all entries
  useEffect(() => {
    // TODO(@barmac): replace with CSS when `:has()` is supported in all major browsers, or rewrite as in https://github.com/camunda/camunda-modeler/issues/3815#issuecomment-1733038161
    const scheduled = requestAnimationFrame(() => {
      const hasOneEditedEntry = entries.find(entry => {
        const {
          id,
          isEdited
        } = entry;
        const entryNode = query(`[data-entry-id="${id}"]`);
        if (!isFunction(isEdited) || !entryNode) {
          return false;
        }
        const inputNode = query('.bio-properties-panel-input', entryNode);
        return isEdited(inputNode);
      });
      setEdited(hasOneEditedEntry);
    });
    return () => cancelAnimationFrame(scheduled);
  }, [entries, setEdited]);

  // set error state depending on all entries
  const allErrors = useErrors();
  const hasErrors = entries.some(entry => allErrors[entry.id]);

  // set css class when group is sticky to top
  useStickyIntersectionObserver(groupRef, 'div.bio-properties-panel-scroll-container', setSticky);
  const propertiesPanelContext = {
    ...useContext(LayoutContext),
    onShow
  };
  return jsxs("div", {
    class: "bio-properties-panel-group",
    "data-group-id": 'group-' + id,
    ref: groupRef,
    children: [jsxs("div", {
      class: classnames('bio-properties-panel-group-header', edited ? '' : 'empty', open ? 'open' : '', sticky && open ? 'sticky' : ''),
      onClick: toggleOpen,
      children: [jsx("div", {
        title: props.tooltip ? null : label,
        "data-title": label,
        class: "bio-properties-panel-group-header-title",
        children: jsx(TooltipWrapper, {
          value: props.tooltip,
          forId: 'group-' + id,
          element: element,
          parent: groupRef,
          children: label
        })
      }), jsxs("div", {
        class: "bio-properties-panel-group-header-buttons",
        children: [jsx(DataMarker, {
          edited: edited,
          hasErrors: hasErrors
        }), jsx("button", {
          type: "button",
          title: "Toggle section",
          class: "bio-properties-panel-group-header-button bio-properties-panel-arrow",
          children: jsx(ArrowIcon, {
            class: open ? 'bio-properties-panel-arrow-down' : 'bio-properties-panel-arrow-right'
          })
        })]
      })]
    }), jsx("div", {
      class: classnames('bio-properties-panel-group-entries', open ? 'open' : ''),
      children: jsx(LayoutContext.Provider, {
        value: propertiesPanelContext,
        children: entries.map(entry => {
          const {
            component: Component,
            id
          } = entry;
          return createElement(Component, {
            ...entry,
            element: element,
            key: id
          });
        })
      })
    })]
  });
}
function DataMarker(props) {
  const {
    edited,
    hasErrors
  } = props;
  if (hasErrors) {
    return jsx("div", {
      title: "Section contains an error",
      class: "bio-properties-panel-dot bio-properties-panel-dot--error"
    });
  }
  if (edited) {
    return jsx("div", {
      title: "Section contains data",
      class: "bio-properties-panel-dot"
    });
  }
  return null;
}

/**
 * @typedef { {
 *  text: (element: object) => string,
 *  icon?: (element: Object) => import('preact').Component
 * } } PlaceholderDefinition
 *
 * @param { PlaceholderDefinition } props
 */
function Placeholder(props) {
  const {
    text,
    icon: Icon
  } = props;
  return jsx("div", {
    class: "bio-properties-panel open",
    children: jsxs("section", {
      class: "bio-properties-panel-placeholder",
      children: [Icon && jsx(Icon, {
        class: "bio-properties-panel-placeholder-icon"
      }), jsx("p", {
        class: "bio-properties-panel-placeholder-text",
        children: text
      })]
    })
  });
}

function Description(props) {
  const {
    element,
    forId,
    value
  } = props;
  const contextDescription = useDescriptionContext(forId, element);
  const description = value || contextDescription;
  if (description) {
    return jsx("div", {
      class: "bio-properties-panel-description",
      children: description
    });
  }
}

const noop$6 = () => {};

/**
 * Buffer `.focus()` calls while the editor is not initialized.
 * Set Focus inside when the editor is ready.
 */
const useBufferedFocus$1 = function (editor, ref) {
  const [buffer, setBuffer] = useState(undefined);
  ref.current = useMemo(() => ({
    focus: offset => {
      if (editor) {
        editor.focus(offset);
      } else {
        if (typeof offset === 'undefined') {
          offset = Infinity;
        }
        setBuffer(offset);
      }
    }
  }), [editor]);
  useEffect(() => {
    if (typeof buffer !== 'undefined' && editor) {
      editor.focus(buffer);
      setBuffer(false);
    }
  }, [editor, buffer]);
};
const CodeEditor$1 = forwardRef((props, ref) => {
  const {
    onInput,
    disabled,
    tooltipContainer,
    enableGutters,
    value,
    onLint = noop$6,
    onPopupOpen = noop$6,
    popupOpen,
    contentAttributes = {},
    hostLanguage = null,
    singleLine = false
  } = props;
  const inputRef = useRef();
  const [editor, setEditor] = useState();
  const [localValue, setLocalValue] = useState(value || '');
  useBufferedFocus$1(editor, ref);
  const handleInput = useStaticCallback(newValue => {
    onInput(newValue);
    setLocalValue(newValue);
  });
  useEffect(() => {
    let editor;
    editor = new FeelersEditor({
      container: inputRef.current,
      onChange: handleInput,
      value: localValue,
      onLint,
      contentAttributes,
      tooltipContainer,
      enableGutters,
      hostLanguage,
      singleLine
    });
    setEditor(editor);
    return () => {
      onLint([]);
      inputRef.current.innerHTML = '';
      setEditor(null);
    };
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
  }, [value]);
  const handleClick = () => {
    ref.current.focus();
  };
  return jsxs("div", {
    class: classnames('bio-properties-panel-feelers-editor-container', popupOpen ? 'popupOpen' : null),
    children: [jsx("div", {
      class: "bio-properties-panel-feelers-editor__open-popup-placeholder",
      children: "Opened in editor"
    }), jsx("div", {
      name: props.name,
      class: classnames('bio-properties-panel-feelers-editor bio-properties-panel-input', localValue ? 'edited' : null, disabled ? 'disabled' : null),
      ref: inputRef,
      onClick: handleClick
    }), jsx("button", {
      type: "button",
      title: "Open pop-up editor",
      class: "bio-properties-panel-open-feel-popup",
      onClick: () => onPopupOpen('feelers'),
      children: jsx(ExternalLinkIcon, {})
    })]
  });
});

const FeelPopupContext = createContext({
  open: () => {},
  close: () => {},
  source: null
});

const noop$5 = () => {};

/**
 * Buffer `.focus()` calls while the editor is not initialized.
 * Set Focus inside when the editor is ready.
 */
const useBufferedFocus = function (editor, ref) {
  const [buffer, setBuffer] = useState(undefined);
  ref.current = useMemo(() => ({
    focus: offset => {
      if (editor) {
        editor.focus(offset);
      } else {
        if (typeof offset === 'undefined') {
          offset = Infinity;
        }
        setBuffer(offset);
      }
    }
  }), [editor]);
  useEffect(() => {
    if (typeof buffer !== 'undefined' && editor) {
      editor.focus(buffer);
      setBuffer(false);
    }
  }, [editor, buffer]);
};
const CodeEditor = forwardRef((props, ref) => {
  const {
    enableGutters,
    value,
    onInput,
    onFeelToggle = noop$5,
    onLint = noop$5,
    onPopupOpen = noop$5,
    popupOpen,
    disabled,
    tooltipContainer,
    variables
  } = props;
  const inputRef = useRef();
  const [editor, setEditor] = useState();
  const [localValue, setLocalValue] = useState(value || '');
  useBufferedFocus(editor, ref);
  const handleInput = useStaticCallback(newValue => {
    onInput(newValue);
    setLocalValue(newValue);
  });
  const {
    feelEditorExtensions: extensions = []
  } = useContext(FeelPopupContext);
  useEffect(() => {
    let editor;

    /* Trigger FEEL toggle when
     *
     * - `backspace` is pressed
     * - AND the cursor is at the beginning of the input
     */
    const onKeyDown = e => {
      if (e.key !== 'Backspace' || !editor) {
        return;
      }
      const selection = editor.getSelection();
      const range = selection.ranges[selection.mainIndex];
      if (range.from === 0 && range.to === 0) {
        onFeelToggle();
      }
    };
    console.log('FEEL editor extensions', extensions);
    editor = new FeelEditor({
      container: inputRef.current,
      onChange: handleInput,
      onKeyDown: onKeyDown,
      onLint: onLint,
      tooltipContainer: tooltipContainer,
      value: localValue,
      variables: variables,
      extensions: [...(enableGutters ? [lineNumbers()] : []), ...extensions]
    });
    setEditor(editor);
    return () => {
      onLint([]);
      inputRef.current.innerHTML = '';
      setEditor(null);
    };
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
  }, [value]);
  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setVariables(variables);
  }, [variables]);
  const handleClick = () => {
    ref.current.focus();
  };
  return jsxs("div", {
    class: classnames('bio-properties-panel-feel-editor-container', disabled ? 'disabled' : null, popupOpen ? 'popupOpen' : null),
    children: [jsx("div", {
      class: "bio-properties-panel-feel-editor__open-popup-placeholder",
      children: "Opened in editor"
    }), jsx("div", {
      name: props.name,
      class: classnames('bio-properties-panel-input', localValue ? 'edited' : null),
      ref: inputRef,
      onClick: handleClick
    }), jsx("button", {
      type: "button",
      title: "Open pop-up editor",
      class: "bio-properties-panel-open-feel-popup",
      onClick: () => onPopupOpen(),
      children: jsx(PopupIcon, {})
    })]
  });
});

function FeelIndicator(props) {
  const {
    active
  } = props;
  if (!active) {
    return null;
  }
  return jsx("span", {
    class: "bio-properties-panel-feel-indicator",
    children: "="
  });
}

const noop$4 = () => {};

/**
 * @param {Object} props
 * @param {Object} props.label
 * @param {String} props.feel
 */
function FeelIcon(props) {
  const {
    feel = false,
    active,
    disabled = false,
    onClick = noop$4
  } = props;
  const feelRequiredLabel = 'FEEL expression is mandatory';
  const feelOptionalLabel = `Click to ${active ? 'remove' : 'set a'} dynamic value with FEEL expression`;
  const handleClick = e => {
    onClick(e);

    // when pointer event was created from keyboard, keep focus on button
    if (!e.pointerType) {
      e.stopPropagation();
    }
  };
  return jsx("button", {
    type: "button",
    class: classnames('bio-properties-panel-feel-icon', active ? 'active' : null, feel === 'required' ? 'required' : 'optional'),
    onClick: handleClick,
    disabled: feel === 'required' || disabled,
    title: feel === 'required' ? feelRequiredLabel : feelOptionalLabel,
    children: jsx(FeelIcon$1, {})
  });
}

/**
 * Add a dragger that calls back the passed function with
 * { event, delta } on drag.
 *
 * @example
 *
 * function dragMove(event, delta) {
 *   // we are dragging (!!)
 * }
 *
 * domElement.addEventListener('dragstart', dragger(dragMove));
 *
 * @param {Function} fn
 * @param {Element} [dragPreview]
 *
 * @return {Function} drag start callback function
 */
function createDragger(fn, dragPreview) {
  let self;
  let startX, startY;

  /** drag start */
  function onDragStart(event) {
    self = this;
    startX = event.clientX;
    startY = event.clientY;

    // (1) prevent preview image
    if (event.dataTransfer) {
      event.dataTransfer.setDragImage(dragPreview || emptyCanvas(), 0, 0);
    }

    // (2) setup drag listeners

    // attach drag + cleanup event
    // we need to do this to make sure we track cursor
    // movements before we reach other drag event handlers,
    // e.g. in child containers.
    document.addEventListener('dragover', onDrag, true);
    document.addEventListener('dragenter', preventDefault, true);
    document.addEventListener('dragend', onEnd);
    document.addEventListener('drop', preventDefault);
  }
  function onDrag(event) {
    const delta = {
      x: event.clientX - startX,
      y: event.clientY - startY
    };

    // call provided fn with event, delta
    return fn.call(self, event, delta);
  }
  function onEnd() {
    document.removeEventListener('dragover', onDrag, true);
    document.removeEventListener('dragenter', preventDefault, true);
    document.removeEventListener('dragend', onEnd);
    document.removeEventListener('drop', preventDefault);
  }
  return onDragStart;
}
function preventDefault(event) {
  event.preventDefault();
  event.stopPropagation();
}
function emptyCanvas() {
  return domify('<canvas width="0" height="0" />');
}

const noop$3 = () => {};

/**
 * A generic popup component.
 *
 * @param {Object} props
 * @param {HTMLElement} [props.container]
 * @param {string} [props.className]
 * @param {boolean} [props.delayInitialFocus]
 * @param {{x: number, y: number}} [props.position]
 * @param {number} [props.width]
 * @param {number} [props.height]
 * @param {Function} props.onClose
 * @param {Function} [props.onPostActivate]
 * @param {Function} [props.onPostDeactivate]
 * @param {boolean} [props.returnFocus]
 * @param {boolean} [props.closeOnEscape]
 * @param {string} props.title
 * @param {Ref} [ref]
 */
function PopupComponent(props, globalRef) {
  const {
    container,
    className,
    delayInitialFocus,
    position,
    width,
    height,
    onClose,
    onPostActivate = noop$3,
    onPostDeactivate = noop$3,
    returnFocus = true,
    closeOnEscape = true,
    title
  } = props;
  const focusTrapRef = useRef(null);
  const localRef = useRef(null);
  const popupRef = globalRef || localRef;
  const containerNode = useMemo(() => getContainerNode(container), [container]);
  const handleKeydown = event => {
    // do not allow keyboard events to bubble
    event.stopPropagation();
    if (closeOnEscape && event.key === 'Escape') {
      onClose();
    }
  };

  // re-activate focus trap on focus
  const handleFocus = () => {
    if (focusTrapRef.current) {
      focusTrapRef.current.activate();
    }
  };
  let style = {};
  if (position) {
    style = {
      ...style,
      top: position.top + 'px',
      left: position.left + 'px'
    };
  }
  if (width) {
    style.width = width + 'px';
  }
  if (height) {
    style.height = height + 'px';
  }
  useEffect(() => {
    if (popupRef.current) {
      popupRef.current.addEventListener('focusin', handleFocus);
    }
    return () => {
      popupRef.current.removeEventListener('focusin', handleFocus);
    };
  }, [popupRef]);
  useEffect(() => {
    if (popupRef.current) {
      focusTrapRef.current = focusTrap.createFocusTrap(popupRef.current, {
        clickOutsideDeactivates: true,
        delayInitialFocus,
        fallbackFocus: popupRef.current,
        onPostActivate,
        onPostDeactivate,
        returnFocusOnDeactivate: returnFocus
      });
      focusTrapRef.current.activate();
    }
    return () => focusTrapRef.current && focusTrapRef.current.deactivate();
  }, [popupRef]);
  return createPortal(jsx("div", {
    "aria-label": title,
    tabIndex: -1,
    ref: popupRef,
    onKeyDown: handleKeydown,
    role: "dialog",
    class: classnames('bio-properties-panel-popup', className),
    style: style,
    children: props.children
  }), containerNode || document.body);
}
const Popup = forwardRef(PopupComponent);
Popup.Title = Title;
Popup.Body = Body;
Popup.Footer = Footer;
function Title(props) {
  const {
    children,
    className,
    draggable,
    emit = () => {},
    title,
    ...rest
  } = props;

  // we can't use state as we need to
  // manipulate this inside dragging events
  const context = useRef({
    startPosition: null,
    newPosition: null
  });
  const dragPreviewRef = useRef();
  const titleRef = useRef();
  const onMove = (event, delta) => {
    cancel(event);
    const {
      x: dx,
      y: dy
    } = delta;
    const newPosition = {
      x: context.current.startPosition.x + dx,
      y: context.current.startPosition.y + dy
    };
    const popupParent = getPopupParent(titleRef.current);
    popupParent.style.top = newPosition.y + 'px';
    popupParent.style.left = newPosition.x + 'px';

    // notify interested parties
    emit('dragover', {
      newPosition,
      delta
    });
  };
  const onMoveStart = event => {
    // initialize drag handler
    const onDragStart = createDragger(onMove, dragPreviewRef.current);
    onDragStart(event);
    event.stopPropagation();
    const popupParent = getPopupParent(titleRef.current);
    const bounds = popupParent.getBoundingClientRect();
    context.current.startPosition = {
      x: bounds.left,
      y: bounds.top
    };

    // notify interested parties
    emit('dragstart');
  };
  const onMoveEnd = () => {
    context.current.newPosition = null;

    // notify interested parties
    emit('dragend');
  };
  return jsxs("div", {
    class: classnames('bio-properties-panel-popup__header', draggable && 'draggable', className),
    ref: titleRef,
    draggable: draggable,
    onDragStart: onMoveStart,
    onDragEnd: onMoveEnd,
    ...rest,
    children: [draggable && jsxs(Fragment, {
      children: [jsx("div", {
        ref: dragPreviewRef,
        class: "bio-properties-panel-popup__drag-preview"
      }), jsx("div", {
        class: "bio-properties-panel-popup__drag-handle",
        children: jsx(DragIcon, {})
      })]
    }), jsx("div", {
      class: "bio-properties-panel-popup__title",
      children: title
    }), children]
  });
}
function Body(props) {
  const {
    children,
    className,
    ...rest
  } = props;
  return jsx("div", {
    class: classnames('bio-properties-panel-popup__body', className),
    ...rest,
    children: children
  });
}
function Footer(props) {
  const {
    children,
    className,
    ...rest
  } = props;
  return jsx("div", {
    class: classnames('bio-properties-panel-popup__footer', className),
    ...rest,
    children: props.children
  });
}

// helpers //////////////////////

function getPopupParent(node) {
  return node.closest('.bio-properties-panel-popup');
}
function cancel(event) {
  event.preventDefault();
  event.stopPropagation();
}
function getContainerNode(node) {
  if (typeof node === 'string') {
    return query(node);
  }
  return node;
}

const FEEL_POPUP_WIDTH = 700;
const FEEL_POPUP_HEIGHT = 250;

/**
 * FEEL popup component, built as a singleton. Emits lifecycle events as follows:
 *  - `feelPopup.open` - fired before the popup is mounted
 *  - `feelPopup.opened` - fired after the popup is mounted. Event context contains the DOM node of the popup
 *  - `feelPopup.close` - fired before the popup is unmounted. Event context contains the DOM node of the popup
 *  - `feelPopup.closed` - fired after the popup is unmounted
 */
function FEELPopupRoot(props) {
  const {
    element,
    eventBus = {
      fire() {},
      on() {},
      off() {}
    },
    popupContainer,
    feelEditorExtensions
  } = props;
  const prevElement = usePrevious(element);
  const [popupConfig, setPopupConfig] = useState({});
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState(null);
  const [sourceElement, setSourceElement] = useState(null);
  const emit = (type, context) => {
    eventBus.fire('feelPopup.' + type, context);
  };
  const isOpen = useCallback(() => {
    return !!open;
  }, [open]);
  useUpdateEffect(() => {
    if (!open) {
      emit('closed');
    }
  }, [open]);
  const handleOpen = (entryId, config, _sourceElement) => {
    setSource(entryId);
    setPopupConfig(config);
    setOpen(true);
    setSourceElement(_sourceElement);
    emit('open');
  };
  const handleClose = () => {
    setOpen(false);
    setSource(null);
  };
  const feelPopupContext = {
    open: handleOpen,
    close: handleClose,
    source,
    feelEditorExtensions
  };

  // close popup on element change, cf. https://github.com/bpmn-io/properties-panel/issues/270
  useEffect(() => {
    if (element && prevElement && element !== prevElement) {
      handleClose();
    }
  }, [element]);

  // allow close and open via events
  useEffect(() => {
    const handlePopupOpen = context => {
      const {
        entryId,
        popupConfig,
        sourceElement
      } = context;
      handleOpen(entryId, popupConfig, sourceElement);
    };
    const handleIsOpen = () => {
      return isOpen();
    };
    eventBus.on('feelPopup._close', handleClose);
    eventBus.on('feelPopup._open', handlePopupOpen);
    eventBus.on('feelPopup._isOpen', handleIsOpen);
    return () => {
      eventBus.off('feelPopup._close', handleClose);
      eventBus.off('feelPopup._open', handleOpen);
      eventBus.off('feelPopup._isOpen', handleIsOpen);
    };
  }, [eventBus, isOpen]);
  return jsxs(FeelPopupContext.Provider, {
    value: feelPopupContext,
    children: [open && jsx(FeelPopupComponent, {
      onClose: handleClose,
      container: popupContainer,
      sourceElement: sourceElement,
      emit: emit,
      ...popupConfig
    }), props.children]
  });
}
function FeelPopupComponent(props) {
  const {
    container,
    id,
    hostLanguage,
    onInput,
    onClose,
    position,
    singleLine,
    sourceElement,
    title,
    tooltipContainer,
    type,
    value,
    variables,
    emit
  } = props;
  const editorRef = useRef();
  const popupRef = useRef();
  const isAutoCompletionOpen = useRef(false);
  const handleSetReturnFocus = () => {
    sourceElement && sourceElement.focus();
  };
  const onKeyDownCapture = event => {
    // we use capture here to make sure we handle the event before the editor does
    if (event.key === 'Escape') {
      isAutoCompletionOpen.current = autoCompletionOpen(event.target);
    }
  };
  const onKeyDown = event => {
    if (event.key === 'Escape') {
      // close popup only if auto completion is not open
      // we need to do check this because the editor is not
      // stop propagating the keydown event
      // cf. https://discuss.codemirror.net/t/how-can-i-replace-the-default-autocompletion-keymap-v6/3322/5
      if (!isAutoCompletionOpen.current) {
        onClose();
        isAutoCompletionOpen.current = false;
      }
    }
  };
  useEffect(() => {
    emit('opened', {
      domNode: popupRef.current
    });
    return () => emit('close', {
      domNode: popupRef.current
    });
  }, []);
  useEffect(() => {
    // Set focus on editor when popup is opened
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, [editorRef]);
  return jsxs(Popup, {
    container: container,
    className: "bio-properties-panel-feel-popup",
    emit: emit,
    position: position,
    title: title,
    onClose: onClose

    // handle focus manually on deactivate
    ,
    returnFocus: false,
    closeOnEscape: false,
    delayInitialFocus: false,
    onPostDeactivate: handleSetReturnFocus,
    height: FEEL_POPUP_HEIGHT,
    width: FEEL_POPUP_WIDTH,
    ref: popupRef,
    children: [jsxs(Popup.Title, {
      title: title,
      emit: emit,
      draggable: true,
      children: [type === 'feel' && jsxs("a", {
        href: "https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/",
        target: "_blank",
        class: "bio-properties-panel-feel-popup__title-link",
        children: ["Learn FEEL expressions", jsx(HelpIcon, {})]
      }), type === 'feelers' && jsxs("a", {
        href: "https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-templating-syntax/",
        target: "_blank",
        class: "bio-properties-panel-feel-popup__title-link",
        children: ["Learn templating", jsx(HelpIcon, {})]
      })]
    }), jsx(Popup.Body, {
      children: jsxs("div", {
        onKeyDownCapture: onKeyDownCapture,
        onKeyDown: onKeyDown,
        class: "bio-properties-panel-feel-popup__body",
        children: [type === 'feel' && jsx(CodeEditor, {
          enableGutters: true,
          id: prefixId$8(id),
          name: id,
          onInput: onInput,
          value: value,
          variables: variables,
          ref: editorRef,
          tooltipContainer: tooltipContainer
        }), type === 'feelers' && jsx(CodeEditor$1, {
          id: prefixId$8(id),
          contentAttributes: {
            'aria-label': title
          },
          enableGutters: true,
          hostLanguage: hostLanguage,
          name: id,
          onInput: onInput,
          value: value,
          ref: editorRef,
          singleLine: singleLine,
          tooltipContainer: tooltipContainer
        })]
      })
    }), jsx(Popup.Footer, {
      children: jsx("button", {
        type: "button",
        onClick: onClose,
        title: "Close pop-up editor",
        class: "bio-properties-panel-feel-popup__close-btn",
        children: "Close"
      })
    })]
  });
}

// helpers /////////////////

function prefixId$8(id) {
  return `bio-properties-panel-${id}`;
}
function autoCompletionOpen(element) {
  return element.closest('.cm-editor').querySelector('.cm-tooltip-autocomplete');
}

/**
 * This hook behaves like useEffect, but does not trigger on the first render.
 *
 * @param {Function} effect
 * @param {Array} deps
 */
function useUpdateEffect(effect, deps) {
  const isMounted = useRef(false);
  useEffect(() => {
    if (isMounted.current) {
      return effect();
    } else {
      isMounted.current = true;
    }
  }, deps);
}

function ToggleSwitch(props) {
  const {
    id,
    label,
    onInput,
    value,
    switcherLabel,
    inline,
    onFocus,
    onBlur,
    inputRef,
    tooltip
  } = props;
  const [localValue, setLocalValue] = useState(value);
  const handleInputCallback = async () => {
    onInput(!value);
  };
  const handleInput = e => {
    handleInputCallback();
    setLocalValue(e.target.value);
  };
  useEffect(() => {
    if (value === localValue) {
      return;
    }
    setLocalValue(value);
  }, [value]);
  return jsxs("div", {
    class: classnames('bio-properties-panel-toggle-switch', {
      inline
    }),
    children: [jsx("label", {
      class: "bio-properties-panel-label",
      for: prefixId$7(id),
      children: jsx(TooltipWrapper, {
        value: tooltip,
        forId: id,
        element: props.element,
        children: label
      })
    }), jsxs("div", {
      class: "bio-properties-panel-field-wrapper",
      children: [jsxs("label", {
        class: "bio-properties-panel-toggle-switch__switcher",
        children: [jsx("input", {
          ref: inputRef,
          id: prefixId$7(id),
          class: "bio-properties-panel-input",
          type: "checkbox",
          onFocus: onFocus,
          onBlur: onBlur,
          name: id,
          onInput: handleInput,
          checked: !!localValue
        }), jsx("span", {
          class: "bio-properties-panel-toggle-switch__slider"
        })]
      }), switcherLabel && jsx("p", {
        class: "bio-properties-panel-toggle-switch__label",
        children: switcherLabel
      })]
    })]
  });
}

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.description
 * @param {String} props.label
 * @param {String} props.switcherLabel
 * @param {Boolean} props.inline
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 * @param {string|import('preact').Component} props.tooltip
 */
function ToggleSwitchEntry(props) {
  const {
    element,
    id,
    description,
    label,
    switcherLabel,
    inline,
    getValue,
    setValue,
    onFocus,
    onBlur,
    tooltip
  } = props;
  const value = getValue(element);
  return jsxs("div", {
    class: "bio-properties-panel-entry bio-properties-panel-toggle-switch-entry",
    "data-entry-id": id,
    children: [jsx(ToggleSwitch, {
      id: id,
      label: label,
      value: value,
      onInput: setValue,
      onFocus: onFocus,
      onBlur: onBlur,
      switcherLabel: switcherLabel,
      inline: inline,
      tooltip: tooltip,
      element: element
    }), jsx(Description, {
      forId: id,
      element: element,
      value: description
    })]
  });
}
function isEdited$8(node) {
  return node && !!node.checked;
}

// helpers /////////////////

function prefixId$7(id) {
  return `bio-properties-panel-${id}`;
}

function NumberField(props) {
  const {
    debounce,
    disabled,
    displayLabel = true,
    id,
    inputRef,
    label,
    max,
    min,
    onInput,
    step,
    value = '',
    onFocus,
    onBlur
  } = props;
  const [localValue, setLocalValue] = useState(value);
  const handleInputCallback = useMemo(() => {
    return debounce(target => {
      if (target.validity.valid) {
        onInput(target.value ? parseFloat(target.value) : undefined);
      }
    });
  }, [onInput, debounce]);
  const handleInput = e => {
    handleInputCallback(e.target);
    setLocalValue(e.target.value);
  };
  useEffect(() => {
    if (value === localValue) {
      return;
    }
    setLocalValue(value);
  }, [value]);
  return jsxs("div", {
    class: "bio-properties-panel-numberfield",
    children: [displayLabel && jsx("label", {
      for: prefixId$6(id),
      class: "bio-properties-panel-label",
      children: label
    }), jsx("input", {
      id: prefixId$6(id),
      ref: inputRef,
      type: "number",
      name: id,
      spellCheck: "false",
      autoComplete: "off",
      disabled: disabled,
      class: "bio-properties-panel-input",
      max: max,
      min: min,
      onInput: handleInput,
      onFocus: onFocus,
      onBlur: onBlur,
      step: step,
      value: localValue
    })]
  });
}

/**
 * @param {Object} props
 * @param {Boolean} props.debounce
 * @param {String} props.description
 * @param {Boolean} props.disabled
 * @param {Object} props.element
 * @param {Function} props.getValue
 * @param {String} props.id
 * @param {String} props.label
 * @param {String} props.max
 * @param {String} props.min
 * @param {Function} props.setValue
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 * @param {String} props.step
 * @param {Function} props.validate
 */
function NumberFieldEntry(props) {
  const {
    debounce,
    description,
    disabled,
    element,
    getValue,
    id,
    label,
    max,
    min,
    setValue,
    step,
    onFocus,
    onBlur,
    validate
  } = props;
  const globalError = useError(id);
  const [localError, setLocalError] = useState(null);
  let value = getValue(element);
  useEffect(() => {
    if (isFunction(validate)) {
      const newValidationError = validate(value) || null;
      setLocalError(newValidationError);
    }
  }, [value]);
  const onInput = newValue => {
    let newValidationError = null;
    if (isFunction(validate)) {
      newValidationError = validate(newValue) || null;
    }
    setValue(newValue, newValidationError);
    setLocalError(newValidationError);
  };
  const error = globalError || localError;
  return jsxs("div", {
    class: classnames('bio-properties-panel-entry', error ? 'has-error' : ''),
    "data-entry-id": id,
    children: [jsx(NumberField, {
      debounce: debounce,
      disabled: disabled,
      id: id,
      label: label,
      onFocus: onFocus,
      onBlur: onBlur,
      onInput: onInput,
      max: max,
      min: min,
      step: step,
      value: value
    }, element), error && jsx("div", {
      class: "bio-properties-panel-error",
      children: error
    }), jsx(Description, {
      forId: id,
      element: element,
      value: description
    })]
  });
}
function isEdited$7(node) {
  return node && !!node.value;
}

// helpers /////////////////

function prefixId$6(id) {
  return `bio-properties-panel-${id}`;
}

const noop$2 = () => {};
function FeelTextfield(props) {
  const {
    debounce,
    id,
    element,
    label,
    hostLanguage,
    onInput,
    onError,
    feel,
    value = '',
    disabled = false,
    variables,
    singleLine,
    tooltipContainer,
    OptionalComponent = OptionalFeelInput,
    tooltip
  } = props;
  const [localValue, _setLocalValue] = useState(value);
  const editorRef = useShowEntryEvent(id);
  const containerRef = useRef();
  const feelActive = isString(localValue) && localValue.startsWith('=') || feel === 'required';
  const feelOnlyValue = isString(localValue) && localValue.startsWith('=') ? localValue.substring(1) : localValue;
  const [focus, _setFocus] = useState(undefined);
  const {
    open: openPopup,
    source: popupSource
  } = useContext(FeelPopupContext);
  const popuOpen = popupSource === id;
  const setFocus = (offset = 0) => {
    const hasFocus = containerRef.current.contains(document.activeElement);

    // Keep caret position if it is already focused, otherwise focus at the end
    const position = hasFocus ? document.activeElement.selectionStart : Infinity;
    _setFocus(position + offset);
  };
  const handleInputCallback = useMemo(() => {
    return debounce(newValue => {
      onInput(newValue);
    });
  }, [onInput, debounce]);
  const setLocalValue = newValue => {
    _setLocalValue(newValue);
    if (typeof newValue === 'undefined' || newValue === '' || newValue === '=') {
      handleInputCallback(undefined);
    } else {
      handleInputCallback(newValue);
    }
  };
  const handleFeelToggle = useStaticCallback(() => {
    if (feel === 'required') {
      return;
    }
    if (!feelActive) {
      setLocalValue('=' + localValue);
    } else {
      setLocalValue(feelOnlyValue);
    }
  });
  const handleLocalInput = newValue => {
    if (feelActive) {
      newValue = '=' + newValue;
    }
    if (newValue === localValue) {
      return;
    }
    setLocalValue(newValue);
    if (!feelActive && isString(newValue) && newValue.startsWith('=')) {
      // focus is behind `=` sign that will be removed
      setFocus(-1);
    }
  };
  const handleLint = useStaticCallback(lint => {
    if (!(lint && lint.length)) {
      onError(undefined);
      return;
    }
    const error = lint[0];
    const message = `${error.source}: ${error.message}`;
    onError(message);
  });
  const handlePopupOpen = (type = 'feel') => {
    const popupOptions = {
      id,
      hostLanguage,
      onInput: handleLocalInput,
      position: calculatePopupPosition(containerRef.current),
      singleLine,
      title: getPopupTitle(element, label),
      tooltipContainer,
      type,
      value: feelOnlyValue,
      variables
    };
    openPopup(id, popupOptions, editorRef.current);
  };
  useEffect(() => {
    if (typeof focus !== 'undefined') {
      editorRef.current.focus(focus);
      _setFocus(undefined);
    }
  }, [focus]);
  useEffect(() => {
    if (value === localValue) {
      return;
    }

    // External value change removed content => keep FEEL configuration
    if (!value) {
      setLocalValue(feelActive ? '=' : '');
      return;
    }
    setLocalValue(value);
  }, [value]);

  // copy-paste integration
  useEffect(() => {
    const copyHandler = event => {
      if (!feelActive) {
        return;
      }
      event.clipboardData.setData('application/FEEL', event.clipboardData.getData('text'));
    };
    const pasteHandler = event => {
      if (feelActive || popuOpen) {
        return;
      }
      const data = event.clipboardData.getData('application/FEEL');
      if (data) {
        setTimeout(() => {
          handleFeelToggle();
          setFocus();
        });
      }
    };
    containerRef.current.addEventListener('copy', copyHandler);
    containerRef.current.addEventListener('cut', copyHandler);
    containerRef.current.addEventListener('paste', pasteHandler);
    return () => {
      containerRef.current.removeEventListener('copy', copyHandler);
      containerRef.current.removeEventListener('cut', copyHandler);
      containerRef.current.removeEventListener('paste', pasteHandler);
    };
  }, [containerRef, feelActive, handleFeelToggle, setFocus]);
  return jsxs("div", {
    class: classnames('bio-properties-panel-feel-entry', {
      'feel-active': feelActive
    }),
    children: [jsxs("label", {
      for: prefixId$5(id),
      class: "bio-properties-panel-label",
      onClick: () => setFocus(),
      children: [jsx(TooltipWrapper, {
        value: tooltip,
        forId: id,
        element: props.element,
        children: label
      }), jsx(FeelIcon, {
        label: label,
        feel: feel,
        onClick: handleFeelToggle,
        active: feelActive
      })]
    }), jsxs("div", {
      class: "bio-properties-panel-feel-container",
      ref: containerRef,
      children: [jsx(FeelIndicator, {
        active: feelActive,
        disabled: feel !== 'optional' || disabled,
        onClick: handleFeelToggle
      }), feelActive ? jsx(CodeEditor, {
        id: prefixId$5(id),
        name: id,
        onInput: handleLocalInput,
        disabled: disabled,
        popupOpen: popuOpen,
        onFeelToggle: () => {
          handleFeelToggle();
          setFocus(true);
        },
        onLint: handleLint,
        onPopupOpen: handlePopupOpen,
        value: feelOnlyValue,
        variables: variables,
        ref: editorRef,
        tooltipContainer: tooltipContainer
      }) : jsx(OptionalComponent, {
        ...props,
        popupOpen: popuOpen,
        onInput: handleLocalInput,
        contentAttributes: {
          'id': prefixId$5(id),
          'aria-label': label
        },
        value: localValue,
        ref: editorRef,
        onPopupOpen: handlePopupOpen,
        containerRef: containerRef
      })]
    })]
  });
}
const OptionalFeelInput = forwardRef((props, ref) => {
  const {
    id,
    disabled,
    onInput,
    value,
    onFocus,
    onBlur
  } = props;
  const inputRef = useRef();

  // To be consistent with the FEEL editor, set focus at start of input
  // this ensures clean editing experience when switching with the keyboard
  ref.current = {
    focus: position => {
      const input = inputRef.current;
      if (!input) {
        return;
      }
      input.focus();
      if (typeof position === 'number') {
        if (position > value.length) {
          position = value.length;
        }
        input.setSelectionRange(position, position);
      }
    }
  };
  return jsx("input", {
    id: prefixId$5(id),
    type: "text",
    ref: inputRef,
    name: id,
    spellCheck: "false",
    autoComplete: "off",
    disabled: disabled,
    class: "bio-properties-panel-input",
    onInput: e => onInput(e.target.value),
    onFocus: onFocus,
    onBlur: onBlur,
    value: value || ''
  });
});
const OptionalFeelNumberField = forwardRef((props, ref) => {
  const {
    id,
    debounce,
    disabled,
    onInput,
    value,
    min,
    max,
    step,
    onFocus,
    onBlur
  } = props;
  const inputRef = useRef();

  // To be consistent with the FEEL editor, set focus at start of input
  // this ensures clean editing experience when switching with the keyboard
  ref.current = {
    focus: position => {
      const input = inputRef.current;
      if (!input) {
        return;
      }
      input.focus();
      if (typeof position === 'number' && position !== Infinity) {
        if (position > value.length) {
          position = value.length;
        }
        input.setSelectionRange(position, position);
      }
    }
  };
  return jsx(NumberField, {
    id: id,
    debounce: debounce,
    disabled: disabled,
    displayLabel: false,
    inputRef: inputRef,
    max: max,
    min: min,
    onInput: onInput,
    step: step,
    value: value,
    onFocus: onFocus,
    onBlur: onBlur
  });
});
const OptionalFeelTextArea = forwardRef((props, ref) => {
  const {
    id,
    disabled,
    onInput,
    value,
    onFocus,
    onBlur
  } = props;
  const inputRef = useRef();

  // To be consistent with the FEEL editor, set focus at start of input
  // this ensures clean editing experience when switching with the keyboard
  ref.current = {
    focus: () => {
      const input = inputRef.current;
      if (!input) {
        return;
      }
      input.focus();
      input.setSelectionRange(0, 0);
    }
  };
  return jsx("textarea", {
    id: prefixId$5(id),
    type: "text",
    ref: inputRef,
    name: id,
    spellCheck: "false",
    autoComplete: "off",
    disabled: disabled,
    class: "bio-properties-panel-input",
    onInput: e => onInput(e.target.value),
    onFocus: onFocus,
    onBlur: onBlur,
    value: value || '',
    "data-gramm": "false"
  });
});
const OptionalFeelToggleSwitch = forwardRef((props, ref) => {
  const {
    id,
    onInput,
    value,
    onFocus,
    onBlur,
    switcherLabel
  } = props;
  const inputRef = useRef();

  // To be consistent with the FEEL editor, set focus at start of input
  // this ensures clean editing experience when switching with the keyboard
  ref.current = {
    focus: () => {
      const input = inputRef.current;
      if (!input) {
        return;
      }
      input.focus();
    }
  };
  return jsx(ToggleSwitch, {
    id: id,
    value: value,
    inputRef: inputRef,
    onInput: onInput,
    onFocus: onFocus,
    onBlur: onBlur,
    switcherLabel: switcherLabel
  });
});
const OptionalFeelCheckbox = forwardRef((props, ref) => {
  const {
    id,
    disabled,
    onInput,
    value,
    onFocus,
    onBlur
  } = props;
  const inputRef = useRef();
  const handleChange = ({
    target
  }) => {
    onInput(target.checked);
  };

  // To be consistent with the FEEL editor, set focus at start of input
  // this ensures clean editing experience when switching with the keyboard
  ref.current = {
    focus: () => {
      const input = inputRef.current;
      if (!input) {
        return;
      }
      input.focus();
    }
  };
  return jsx("input", {
    ref: inputRef,
    id: prefixId$5(id),
    name: id,
    onFocus: onFocus,
    onBlur: onBlur,
    type: "checkbox",
    class: "bio-properties-panel-input",
    onChange: handleChange,
    checked: value,
    disabled: disabled
  });
});

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.description
 * @param {Boolean} props.debounce
 * @param {Boolean} props.disabled
 * @param {Boolean} props.feel
 * @param {String} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.tooltipContainer
 * @param {Function} props.validate
 * @param {Function} props.show
 * @param {Function} props.example
 * @param {Function} props.variables
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 * @param {string|import('preact').Component} props.tooltip
 */
function FeelEntry(props) {
  const {
    element,
    id,
    description,
    debounce,
    disabled,
    feel,
    label,
    getValue,
    setValue,
    tooltipContainer,
    hostLanguage,
    singleLine,
    validate,
    show = noop$2,
    example,
    variables,
    onFocus,
    onBlur,
    tooltip
  } = props;
  const [validationError, setValidationError] = useState(null);
  const [localError, setLocalError] = useState(null);
  let value = getValue(element);
  useEffect(() => {
    if (isFunction(validate)) {
      const newValidationError = validate(value) || null;
      setValidationError(newValidationError);
    }
  }, [value]);
  const onInput = useStaticCallback(newValue => {
    let newValidationError = null;
    if (isFunction(validate)) {
      newValidationError = validate(newValue) || null;
    }

    // don't create multiple commandStack entries for the same value
    if (newValue !== value) {
      setValue(newValue, newValidationError);
    }
    setValidationError(newValidationError);
  });
  const onError = useCallback(err => {
    setLocalError(err);
  }, []);
  const temporaryError = useError(id);
  const error = temporaryError || localError || validationError;
  return jsxs("div", {
    class: classnames(props.class, 'bio-properties-panel-entry', error ? 'has-error' : ''),
    "data-entry-id": id,
    children: [createElement(FeelTextfield, {
      ...props,
      debounce: debounce,
      disabled: disabled,
      feel: feel,
      id: id,
      key: element,
      label: label,
      onInput: onInput,
      onError: onError,
      onFocus: onFocus,
      onBlur: onBlur,
      example: example,
      hostLanguage: hostLanguage,
      singleLine: singleLine,
      show: show,
      value: value,
      variables: variables,
      tooltipContainer: tooltipContainer,
      OptionalComponent: props.OptionalComponent,
      tooltip: tooltip
    }), error && jsx("div", {
      class: "bio-properties-panel-error",
      children: error
    }), jsx(Description, {
      forId: id,
      element: element,
      value: description
    })]
  });
}

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.description
 * @param {Boolean} props.debounce
 * @param {Boolean} props.disabled
 * @param {String} props.max
 * @param {String} props.min
 * @param {String} props.step
 * @param {Boolean} props.feel
 * @param {String} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.tooltipContainer
 * @param {Function} props.validate
 * @param {Function} props.show
 * @param {Function} props.example
 * @param {Function} props.variables
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 */
function FeelNumberEntry(props) {
  return jsx(FeelEntry, {
    class: "bio-properties-panel-feel-number",
    OptionalComponent: OptionalFeelNumberField,
    ...props
  });
}

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.description
 * @param {Boolean} props.debounce
 * @param {Boolean} props.disabled
 * @param {Boolean} props.feel
 * @param {String} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.tooltipContainer
 * @param {Function} props.validate
 * @param {Function} props.show
 * @param {Function} props.example
 * @param {Function} props.variables
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 */
function FeelTextAreaEntry(props) {
  return jsx(FeelEntry, {
    class: "bio-properties-panel-feel-textarea",
    OptionalComponent: OptionalFeelTextArea,
    ...props
  });
}

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.description
 * @param {Boolean} props.debounce
 * @param {Boolean} props.disabled
 * @param {Boolean} props.feel
 * @param {String} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.tooltipContainer
 * @param {Function} props.validate
 * @param {Function} props.show
 * @param {Function} props.example
 * @param {Function} props.variables
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 */
function FeelToggleSwitchEntry(props) {
  return jsx(FeelEntry, {
    class: "bio-properties-panel-feel-toggle-switch",
    OptionalComponent: OptionalFeelToggleSwitch,
    ...props
  });
}

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.description
 * @param {Boolean} props.debounce
 * @param {Boolean} props.disabled
 * @param {Boolean} props.feel
 * @param {String} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.tooltipContainer
 * @param {Function} props.validate
 * @param {Function} props.show
 * @param {Function} props.example
 * @param {Function} props.variables
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 */
function FeelCheckboxEntry(props) {
  return jsx(FeelEntry, {
    class: "bio-properties-panel-feel-checkbox",
    OptionalComponent: OptionalFeelCheckbox,
    ...props
  });
}

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.description
 * @param {String} props.hostLanguage
 * @param {Boolean} props.singleLine
 * @param {Boolean} props.debounce
 * @param {Boolean} props.disabled
 * @param {Boolean} props.feel
 * @param {String} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.tooltipContainer
 * @param {Function} props.validate
 * @param {Function} props.show
 * @param {Function} props.example
 * @param {Function} props.variables
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 */
function FeelTemplatingEntry(props) {
  return jsx(FeelEntry, {
    class: "bio-properties-panel-feel-templating",
    OptionalComponent: CodeEditor$1,
    ...props
  });
}
function isEdited$6(node) {
  if (!node) {
    return false;
  }
  if (node.type === 'checkbox') {
    return !!node.checked || node.classList.contains('edited');
  }
  return !!node.value || node.classList.contains('edited');
}

// helpers /////////////////

function prefixId$5(id) {
  return `bio-properties-panel-${id}`;
}
function calculatePopupPosition(element) {
  const {
    top,
    left
  } = element.getBoundingClientRect();
  return {
    left: left - FEEL_POPUP_WIDTH - 20,
    top: top
  };
}

// todo(pinussilvestrus): make this configurable in the future
function getPopupTitle(element, label) {
  return label;
}

const DEFAULT_LAYOUT = {};
const DEFAULT_DESCRIPTION = {};
const DEFAULT_TOOLTIP = {};

/**
 * @typedef { {
 *    component: import('preact').Component,
 *    id: String,
 *    isEdited?: Function
 * } } EntryDefinition
 *
 * @typedef { {
 *    autoFocusEntry: String,
 *    autoOpen?: Boolean,
 *    entries: Array<EntryDefinition>,
 *    id: String,
 *    label: String,
 *    remove: (event: MouseEvent) => void
 * } } ListItemDefinition
 *
 * @typedef { {
 *    add: (event: MouseEvent) => void,
 *    component: import('preact').Component,
 *    element: Object,
 *    id: String,
 *    items: Array<ListItemDefinition>,
 *    label: String,
 *    shouldSort?: Boolean,
 *    shouldOpen?: Boolean
 * } } ListGroupDefinition
 *
 * @typedef { {
 *    component?: import('preact').Component,
 *    entries: Array<EntryDefinition>,
 *    id: String,
 *    label: String,
 *    shouldOpen?: Boolean
 * } } GroupDefinition
 *
 *  @typedef { {
 *    [id: String]: GetDescriptionFunction
 * } } DescriptionConfig
 *
 *  @typedef { {
 *    [id: String]: GetTooltipFunction
 * } } TooltipConfig
 *
 * @callback { {
 * @param {string} id
 * @param {Object} element
 * @returns {string}
 * } } GetDescriptionFunction
 *
 * @callback { {
 * @param {string} id
 * @param {Object} element
 * @returns {string}
 * } } GetTooltipFunction
 *
 * @typedef { {
 *  getEmpty: (element: object) => import('./components/Placeholder').PlaceholderDefinition,
 *  getMultiple: (element: Object) => import('./components/Placeholder').PlaceholderDefinition
 * } } PlaceholderProvider
 *
 */

/**
 * A basic properties panel component. Describes *how* content will be rendered, accepts
 * data from implementor to describe *what* will be rendered.
 *
 * @param {Object} props
 * @param {Object|Array} props.element
 * @param {import('./components/Header').HeaderProvider} props.headerProvider
 * @param {PlaceholderProvider} [props.placeholderProvider]
 * @param {Array<GroupDefinition|ListGroupDefinition>} props.groups
 * @param {Object} [props.layoutConfig]
 * @param {Function} [props.layoutChanged]
 * @param {DescriptionConfig} [props.descriptionConfig]
 * @param {Function} [props.descriptionLoaded]
 * @param {TooltipConfig} [props.tooltipConfig]
 * @param {Function} [props.tooltipLoaded]
 * @param {HTMLElement} [props.feelPopupContainer]
 * @param {Object} [props.eventBus]
 */
function PropertiesPanel(props) {
  const {
    element,
    headerProvider,
    placeholderProvider,
    groups,
    layoutConfig,
    layoutChanged,
    descriptionConfig,
    descriptionLoaded,
    tooltipConfig,
    tooltipLoaded,
    feelPopupContainer,
    eventBus,
    feelEditorExtensions
  } = props;

  // set-up layout context
  const [layout, setLayout] = useState(createLayout(layoutConfig));

  // react to external changes in the layout config
  useUpdateLayoutEffect(() => {
    const newLayout = createLayout(layoutConfig);
    setLayout(newLayout);
  }, [layoutConfig]);
  useEffect(() => {
    if (typeof layoutChanged === 'function') {
      layoutChanged(layout);
    }
  }, [layout, layoutChanged]);
  const getLayoutForKey = (key, defaultValue) => {
    return get(layout, key, defaultValue);
  };
  const setLayoutForKey = (key, config) => {
    const newLayout = assign({}, layout);
    set(newLayout, key, config);
    setLayout(newLayout);
  };
  const layoutContext = {
    layout,
    setLayout,
    getLayoutForKey,
    setLayoutForKey
  };

  // set-up description context
  const description = useMemo(() => createDescriptionContext(descriptionConfig), [descriptionConfig]);
  useEffect(() => {
    if (typeof descriptionLoaded === 'function') {
      descriptionLoaded(description);
    }
  }, [description, descriptionLoaded]);
  const getDescriptionForId = (id, element) => {
    return description[id] && description[id](element);
  };
  const descriptionContext = {
    description,
    getDescriptionForId
  };

  // set-up tooltip context
  const tooltip = useMemo(() => createTooltipContext(tooltipConfig), [tooltipConfig]);
  useEffect(() => {
    if (typeof tooltipLoaded === 'function') {
      tooltipLoaded(tooltip);
    }
  }, [tooltip, tooltipLoaded]);
  const getTooltipForId = (id, element) => {
    return tooltip[id] && tooltip[id](element);
  };
  const tooltipContext = {
    tooltip,
    getTooltipForId
  };
  const [errors, setErrors] = useState({});
  const onSetErrors = ({
    errors
  }) => setErrors(errors);
  useEvent('propertiesPanel.setErrors', onSetErrors, eventBus);
  const errorsContext = {
    errors
  };
  const eventContext = {
    eventBus
  };
  const propertiesPanelContext = {
    element
  };

  // empty state
  if (placeholderProvider && !element) {
    return jsx(Placeholder, {
      ...placeholderProvider.getEmpty()
    });
  }

  // multiple state
  if (placeholderProvider && isArray(element)) {
    return jsx(Placeholder, {
      ...placeholderProvider.getMultiple()
    });
  }
  return jsx(LayoutContext.Provider, {
    value: propertiesPanelContext,
    children: jsx(ErrorsContext.Provider, {
      value: errorsContext,
      children: jsx(DescriptionContext.Provider, {
        value: descriptionContext,
        children: jsx(TooltipContext.Provider, {
          value: tooltipContext,
          children: jsx(LayoutContext.Provider, {
            value: layoutContext,
            children: jsx(EventContext.Provider, {
              value: eventContext,
              children: jsx(FEELPopupRoot, {
                element: element,
                eventBus: eventBus,
                popupContainer: feelPopupContainer,
                feelEditorExtensions: feelEditorExtensions,
                children: jsxs("div", {
                  class: "bio-properties-panel",
                  children: [jsx(Header, {
                    element: element,
                    headerProvider: headerProvider
                  }), jsx("div", {
                    class: "bio-properties-panel-scroll-container",
                    children: groups.map(group => {
                      const {
                        component: Component = Group,
                        id
                      } = group;
                      return createElement(Component, {
                        ...group,
                        key: id,
                        element: element
                      });
                    })
                  })]
                })
              })
            })
          })
        })
      })
    })
  });
}

// helpers //////////////////

function createLayout(overrides = {}, defaults = DEFAULT_LAYOUT) {
  return {
    ...defaults,
    ...overrides
  };
}
function createDescriptionContext(overrides = {}) {
  return {
    ...DEFAULT_DESCRIPTION,
    ...overrides
  };
}
function createTooltipContext(overrides = {}) {
  return {
    ...DEFAULT_TOOLTIP,
    ...overrides
  };
}

// hooks //////////////////

/**
 * This hook behaves like useLayoutEffect, but does not trigger on the first render.
 *
 * @param {Function} effect
 * @param {Array} deps
 */
function useUpdateLayoutEffect(effect, deps) {
  const isMounted = useRef(false);
  useLayoutEffect(() => {
    if (isMounted.current) {
      return effect();
    } else {
      isMounted.current = true;
    }
  }, deps);
}

function DropdownButton(props) {
  const {
    class: className,
    children,
    menuItems = []
  } = props;
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  function onDropdownToggle(event) {
    if (menuRef.current && menuRef.current.contains(event.target)) {
      return;
    }
    event.stopPropagation();
    setOpen(open => !open);
  }
  function onActionClick(event, action) {
    event.stopPropagation();
    close();
    action();
  }
  useGlobalClick([dropdownRef.current], () => close());
  return jsxs("div", {
    class: classnames('bio-properties-panel-dropdown-button', {
      open
    }, className),
    onClick: onDropdownToggle,
    ref: dropdownRef,
    children: [children, jsx("div", {
      class: "bio-properties-panel-dropdown-button__menu",
      ref: menuRef,
      children: menuItems.map((item, index) => jsx(MenuItem, {
        onClick: onActionClick,
        item: item
      }, index))
    })]
  });
}
function MenuItem({
  item,
  onClick
}) {
  if (item.separator) {
    return jsx("div", {
      class: "bio-properties-panel-dropdown-button__menu-item bio-properties-panel-dropdown-button__menu-item--separator"
    });
  }
  if (item.action) {
    return jsx("button", {
      type: "button",
      class: "bio-properties-panel-dropdown-button__menu-item bio-properties-panel-dropdown-button__menu-item--actionable",
      onClick: event => onClick(event, item.action),
      children: item.entry
    });
  }
  return jsx("div", {
    class: "bio-properties-panel-dropdown-button__menu-item",
    children: item.entry
  });
}

/**
 *
 * @param {Array<null | Element>} ignoredElements
 * @param {Function} callback
 */
function useGlobalClick(ignoredElements, callback) {
  useEffect(() => {
    /**
     * @param {MouseEvent} event
     */
    function listener(event) {
      if (ignoredElements.some(element => element && element.contains(event.target))) {
        return;
      }
      callback();
    }
    document.addEventListener('click', listener, {
      capture: true
    });
    return () => document.removeEventListener('click', listener, {
      capture: true
    });
  }, [...ignoredElements, callback]);
}

function HeaderButton(props) {
  const {
    children = null,
    class: classname,
    onClick = () => {},
    ...otherProps
  } = props;
  return jsx("button", {
    type: "button",
    ...otherProps,
    onClick: onClick,
    class: classnames('bio-properties-panel-group-header-button', classname),
    children: children
  });
}

function CollapsibleEntry(props) {
  const {
    element,
    entries = [],
    id,
    label,
    open: shouldOpen,
    remove
  } = props;
  const [open, setOpen] = useState(shouldOpen);
  const toggleOpen = () => setOpen(!open);
  const {
    onShow
  } = useContext(LayoutContext);
  const propertiesPanelContext = {
    ...useContext(LayoutContext),
    onShow: useCallback(() => {
      setOpen(true);
      if (isFunction(onShow)) {
        onShow();
      }
    }, [onShow, setOpen])
  };

  // todo(pinussilvestrus): translate once we have a translate mechanism for the core
  const placeholderLabel = '<empty>';
  return jsxs("div", {
    "data-entry-id": id,
    class: classnames('bio-properties-panel-collapsible-entry', open ? 'open' : ''),
    children: [jsxs("div", {
      class: "bio-properties-panel-collapsible-entry-header",
      onClick: toggleOpen,
      children: [jsx("div", {
        title: label || placeholderLabel,
        class: classnames('bio-properties-panel-collapsible-entry-header-title', !label && 'empty'),
        children: label || placeholderLabel
      }), jsx("button", {
        type: "button",
        title: "Toggle list item",
        class: "bio-properties-panel-arrow  bio-properties-panel-collapsible-entry-arrow",
        children: jsx(ArrowIcon, {
          class: open ? 'bio-properties-panel-arrow-down' : 'bio-properties-panel-arrow-right'
        })
      }), remove ? jsx("button", {
        type: "button",
        title: "Delete item",
        class: "bio-properties-panel-remove-entry",
        onClick: remove,
        children: jsx(DeleteIcon, {})
      }) : null]
    }), jsx("div", {
      class: classnames('bio-properties-panel-collapsible-entry-entries', open ? 'open' : ''),
      children: jsx(LayoutContext.Provider, {
        value: propertiesPanelContext,
        children: entries.map(entry => {
          const {
            component: Component,
            id
          } = entry;
          return createElement(Component, {
            ...entry,
            element: element,
            key: id
          });
        })
      })
    })]
  });
}

function ListItem(props) {
  const {
    autoFocusEntry,
    autoOpen
  } = props;

  // focus specified entry on auto open
  useEffect(() => {
    if (autoOpen && autoFocusEntry) {
      const entry = query(`[data-entry-id="${autoFocusEntry}"]`);
      const focusableInput = query('.bio-properties-panel-input', entry);
      if (focusableInput) {
        if (isFunction(focusableInput.select)) {
          focusableInput.select();
        } else if (isFunction(focusableInput.focus)) {
          focusableInput.focus();
        }
      }
    }
  }, [autoOpen, autoFocusEntry]);
  return jsx("div", {
    class: "bio-properties-panel-list-item",
    children: jsx(CollapsibleEntry, {
      ...props,
      open: autoOpen
    })
  });
}

const noop$1 = () => {};

/**
 * @param {import('../PropertiesPanel').ListGroupDefinition} props
 */
function ListGroup(props) {
  const {
    add,
    element,
    id,
    items,
    label,
    shouldOpen = true,
    shouldSort = true
  } = props;
  const groupRef = useRef(null);
  const [open, setOpen] = useLayoutState(['groups', id, 'open'], false);
  const [sticky, setSticky] = useState(false);
  const onShow = useCallback(() => setOpen(true), [setOpen]);
  const [ordering, setOrdering] = useState([]);
  const [newItemAdded, setNewItemAdded] = useState(false);

  // Flag to mark that add button was clicked in the last render cycle
  const [addTriggered, setAddTriggered] = useState(false);
  const prevItems = usePrevious(items);
  const prevElement = usePrevious(element);
  const elementChanged = element !== prevElement;
  const shouldHandleEffects = !elementChanged && (shouldSort || shouldOpen);

  // reset initial ordering when element changes (before first render)
  if (elementChanged) {
    setOrdering(createOrdering(shouldSort ? sortItems(items) : items));
  }

  // keep ordering in sync to items - and open changes

  // (0) set initial ordering from given items
  useEffect(() => {
    if (!prevItems || !shouldSort) {
      setOrdering(createOrdering(items));
    }
  }, [items, element]);

  // (1) items were added
  useEffect(() => {
    // reset addTriggered flag
    setAddTriggered(false);
    if (shouldHandleEffects && prevItems && items.length > prevItems.length) {
      let add = [];
      items.forEach(item => {
        if (!ordering.includes(item.id)) {
          add.push(item.id);
        }
      });
      let newOrdering = ordering;

      // open if not open, configured and triggered by add button
      //
      // TODO(marstamm): remove once we refactor layout handling for listGroups.
      // Ideally, opening should be handled as part of the `add` callback and
      // not be a concern for the ListGroup component.
      if (addTriggered && !open && shouldOpen) {
        toggleOpen();
      }

      // filter when not open and configured
      if (!open && shouldSort) {
        newOrdering = createOrdering(sortItems(items));
      }

      // add new items on top or bottom depending on sorting behavior
      newOrdering = newOrdering.filter(item => !add.includes(item));
      if (shouldSort) {
        newOrdering.unshift(...add);
      } else {
        newOrdering.push(...add);
      }
      setOrdering(newOrdering);
      setNewItemAdded(addTriggered);
    } else {
      setNewItemAdded(false);
    }
  }, [items, open, shouldHandleEffects, addTriggered]);

  // (2) sort items on open if shouldSort is set
  useEffect(() => {
    if (shouldSort && open && !newItemAdded) {
      setOrdering(createOrdering(sortItems(items)));
    }
  }, [open, shouldSort]);

  // (3) items were deleted
  useEffect(() => {
    if (shouldHandleEffects && prevItems && items.length < prevItems.length) {
      let keep = [];
      ordering.forEach(o => {
        if (getItem(items, o)) {
          keep.push(o);
        }
      });
      setOrdering(keep);
    }
  }, [items, shouldHandleEffects]);

  // set css class when group is sticky to top
  useStickyIntersectionObserver(groupRef, 'div.bio-properties-panel-scroll-container', setSticky);
  const toggleOpen = () => setOpen(!open);
  const hasItems = !!items.length;
  const propertiesPanelContext = {
    ...useContext(LayoutContext),
    onShow
  };
  const handleAddClick = e => {
    setAddTriggered(true);
    add(e);
  };
  const allErrors = useErrors();
  const hasError = items.some(item => {
    if (allErrors[item.id]) {
      return true;
    }
    if (!item.entries) {
      return;
    }

    // also check if the error is nested, e.g. for name-value entries
    return item.entries.some(entry => allErrors[entry.id]);
  });
  return jsxs("div", {
    class: "bio-properties-panel-group",
    "data-group-id": 'group-' + id,
    ref: groupRef,
    children: [jsxs("div", {
      class: classnames('bio-properties-panel-group-header', hasItems ? '' : 'empty', hasItems && open ? 'open' : '', sticky && open ? 'sticky' : ''),
      onClick: hasItems ? toggleOpen : noop$1,
      children: [jsx("div", {
        title: props.tooltip ? null : label,
        "data-title": label,
        class: "bio-properties-panel-group-header-title",
        children: jsx(TooltipWrapper, {
          value: props.tooltip,
          forId: 'group-' + id,
          element: element,
          parent: groupRef,
          children: label
        })
      }), jsxs("div", {
        class: "bio-properties-panel-group-header-buttons",
        children: [add ? jsxs("button", {
          type: "button",
          title: "Create new list item",
          class: "bio-properties-panel-group-header-button bio-properties-panel-add-entry",
          onClick: handleAddClick,
          children: [jsx(CreateIcon, {}), !hasItems ? jsx("span", {
            class: "bio-properties-panel-add-entry-label",
            children: "Create"
          }) : null]
        }) : null, hasItems ? jsx("div", {
          title: `List contains ${items.length} item${items.length != 1 ? 's' : ''}`,
          class: classnames('bio-properties-panel-list-badge', hasError ? 'bio-properties-panel-list-badge--error' : ''),
          children: items.length
        }) : null, hasItems ? jsx("button", {
          type: "button",
          title: "Toggle section",
          class: "bio-properties-panel-group-header-button bio-properties-panel-arrow",
          children: jsx(ArrowIcon, {
            class: open ? 'bio-properties-panel-arrow-down' : 'bio-properties-panel-arrow-right'
          })
        }) : null]
      })]
    }), jsx("div", {
      class: classnames('bio-properties-panel-list', open && hasItems ? 'open' : ''),
      children: jsx(LayoutContext.Provider, {
        value: propertiesPanelContext,
        children: ordering.map((o, index) => {
          const item = getItem(items, o);
          if (!item) {
            return;
          }
          const {
            id
          } = item;

          // if item was added, open it
          // Existing items will not be affected as autoOpen is only applied on first render
          const autoOpen = newItemAdded;
          return createElement(ListItem, {
            ...item,
            autoOpen: autoOpen,
            element: element,
            index: index,
            key: id
          });
        })
      })
    })]
  });
}

// helpers ////////////////////

/**
 * Sorts given items alphanumeric by label
 */
function sortItems(items) {
  return sortBy(items, i => i.label.toLowerCase());
}
function getItem(items, id) {
  return find(items, i => i.id === id);
}
function createOrdering(items) {
  return items.map(i => i.id);
}

function Checkbox(props) {
  const {
    id,
    label,
    onChange,
    disabled,
    value = false,
    onFocus,
    onBlur,
    tooltip
  } = props;
  const [localValue, setLocalValue] = useState(value);
  const handleChangeCallback = ({
    target
  }) => {
    onChange(target.checked);
  };
  const handleChange = e => {
    handleChangeCallback(e);
    setLocalValue(e.target.value);
  };
  useEffect(() => {
    if (value === localValue) {
      return;
    }
    setLocalValue(value);
  }, [value]);
  const ref = useShowEntryEvent(id);
  return jsxs("div", {
    class: "bio-properties-panel-checkbox",
    children: [jsx("input", {
      ref: ref,
      id: prefixId$4(id),
      name: id,
      onFocus: onFocus,
      onBlur: onBlur,
      type: "checkbox",
      class: "bio-properties-panel-input",
      onChange: handleChange,
      checked: localValue,
      disabled: disabled
    }), jsx("label", {
      for: prefixId$4(id),
      class: "bio-properties-panel-label",
      children: jsx(TooltipWrapper, {
        value: tooltip,
        forId: id,
        element: props.element,
        children: label
      })
    })]
  });
}

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.description
 * @param {String} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 * @param {string|import('preact').Component} props.tooltip
 * @param {boolean} [props.disabled]
 */
function CheckboxEntry(props) {
  const {
    element,
    id,
    description,
    label,
    getValue,
    setValue,
    disabled,
    onFocus,
    onBlur,
    tooltip
  } = props;
  const value = getValue(element);
  const error = useError(id);
  return jsxs("div", {
    class: "bio-properties-panel-entry bio-properties-panel-checkbox-entry",
    "data-entry-id": id,
    children: [jsx(Checkbox, {
      disabled: disabled,
      id: id,
      label: label,
      onChange: setValue,
      onFocus: onFocus,
      onBlur: onBlur,
      value: value,
      tooltip: tooltip,
      element: element
    }, element), error && jsx("div", {
      class: "bio-properties-panel-error",
      children: error
    }), jsx(Description, {
      forId: id,
      element: element,
      value: description
    })]
  });
}
function isEdited$5(node) {
  return node && !!node.checked;
}

// helpers /////////////////

function prefixId$4(id) {
  return `bio-properties-panel-${id}`;
}

const noop = () => {};

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.description
 * @param {Boolean} props.debounce
 * @param {Boolean} props.disabled
 * @param {String} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.tooltipContainer
 * @param {Function} props.validate
 * @param {Function} props.show
 */
function TemplatingEntry(props) {
  const {
    element,
    id,
    description,
    debounce,
    disabled,
    label,
    getValue,
    setValue,
    tooltipContainer,
    validate,
    show = noop
  } = props;
  const [validationError, setValidationError] = useState(null);
  const [localError, setLocalError] = useState(null);
  let value = getValue(element);
  useEffect(() => {
    if (isFunction(validate)) {
      const newValidationError = validate(value) || null;
      setValidationError(newValidationError);
    }
  }, [value]);
  const onInput = useStaticCallback(newValue => {
    let newValidationError = null;
    if (isFunction(validate)) {
      newValidationError = validate(newValue) || null;
    }

    // don't create multiple commandStack entries for the same value
    if (newValue !== value) {
      setValue(newValue, newValidationError);
    }
    setValidationError(newValidationError);
  });
  const onError = useCallback(err => {
    setLocalError(err);
  }, []);
  const temporaryError = useError(id);
  const error = localError || temporaryError || validationError;
  return jsxs("div", {
    class: classnames('bio-properties-panel-entry', error ? 'has-error' : ''),
    "data-entry-id": id,
    children: [jsx(Templating, {
      debounce: debounce,
      disabled: disabled,
      id: id,
      label: label,
      onInput: onInput,
      onError: onError,
      show: show,
      value: value,
      tooltipContainer: tooltipContainer
    }, element), error && jsx("div", {
      class: "bio-properties-panel-error",
      children: error
    }), jsx(Description, {
      forId: id,
      element: element,
      value: description
    })]
  });
}
function Templating(props) {
  const {
    debounce,
    id,
    label,
    onInput,
    onError,
    value = '',
    disabled = false,
    tooltipContainer
  } = props;
  const [localValue, setLocalValue] = useState(value);
  const editorRef = useShowEntryEvent(id);
  const containerRef = useRef();
  const [focus, _setFocus] = useState(undefined);
  const setFocus = (offset = 0) => {
    const hasFocus = containerRef.current.contains(document.activeElement);

    // Keep caret position if it is already focused, otherwise focus at the end
    const position = hasFocus ? document.activeElement.selectionStart : Infinity;
    _setFocus(position + offset);
  };
  const handleInputCallback = useMemo(() => {
    return debounce(newValue => onInput(newValue.length ? newValue : undefined));
  }, [onInput, debounce]);
  const handleInput = newValue => {
    handleInputCallback(newValue);
    setLocalValue(newValue);
  };
  const handleLint = useStaticCallback(lint => {
    const errors = lint && lint.length && lint.filter(e => e.severity === 'error') || [];
    if (!errors.length) {
      onError(undefined);
      return;
    }
    const error = lint[0];
    const message = `${error.source}: ${error.message}`;
    onError(message);
  });
  useEffect(() => {
    if (typeof focus !== 'undefined') {
      editorRef.current.focus(focus);
      _setFocus(undefined);
    }
  }, [focus]);
  useEffect(() => {
    if (value === localValue) {
      return;
    }
    setLocalValue(value ? value : '');
  }, [value]);
  return jsxs("div", {
    class: "bio-properties-panel-feelers",
    children: [jsx("label", {
      id: prefixIdLabel(id),
      class: "bio-properties-panel-label",
      onClick: () => setFocus(),
      children: label
    }), jsx("div", {
      class: "bio-properties-panel-feelers-input",
      ref: containerRef,
      children: jsx(CodeEditor$1, {
        name: id,
        onInput: handleInput,
        contentAttributes: {
          'aria-labelledby': prefixIdLabel(id)
        },
        disabled: disabled,
        onLint: handleLint,
        value: localValue,
        ref: editorRef,
        tooltipContainer: tooltipContainer
      })
    })]
  });
}
function isEdited$4(node) {
  return node && (!!node.value || node.classList.contains('edited'));
}

// helpers /////////////////

function prefixIdLabel(id) {
  return `bio-properties-panel-feelers-${id}-label`;
}

function List(props) {
  const {
    id,
    element,
    items = [],
    component,
    label = '<empty>',
    open: shouldOpen,
    onAdd,
    onRemove,
    autoFocusEntry,
    compareFn,
    ...restProps
  } = props;
  const [open, setOpen] = useState(!!shouldOpen);
  const hasItems = !!items.length;
  const toggleOpen = () => hasItems && setOpen(!open);
  const opening = !usePrevious(open) && open;
  const elementChanged = usePrevious(element) !== element;
  const shouldReset = opening || elementChanged;
  const sortedItems = useSortedItems(items, compareFn, shouldReset);
  const newItems = useNewItems(items, elementChanged);
  useEffect(() => {
    if (open && !hasItems) {
      setOpen(false);
    }
  }, [open, hasItems]);

  /**
   * @param {MouseEvent} event
   */
  function addItem(event) {
    event.stopPropagation();
    onAdd();
    if (!open) {
      setOpen(true);
    }
  }
  return jsxs("div", {
    "data-entry-id": id,
    class: classnames('bio-properties-panel-entry', 'bio-properties-panel-list-entry', hasItems ? '' : 'empty', open ? 'open' : ''),
    children: [jsxs("div", {
      class: "bio-properties-panel-list-entry-header",
      onClick: toggleOpen,
      children: [jsx("div", {
        title: label,
        class: classnames('bio-properties-panel-list-entry-header-title', open && 'open'),
        children: label
      }), jsxs("div", {
        class: "bio-properties-panel-list-entry-header-buttons",
        children: [jsxs("button", {
          type: "button",
          title: "Create new list item",
          onClick: addItem,
          class: "bio-properties-panel-add-entry",
          children: [jsx(CreateIcon, {}), !hasItems ? jsx("span", {
            class: "bio-properties-panel-add-entry-label",
            children: "Create"
          }) : null]
        }), hasItems && jsx("div", {
          title: `List contains ${items.length} item${items.length != 1 ? 's' : ''}`,
          class: "bio-properties-panel-list-badge",
          children: items.length
        }), hasItems && jsx("button", {
          type: "button",
          title: "Toggle list item",
          class: "bio-properties-panel-arrow",
          children: jsx(ArrowIcon, {
            class: open ? 'bio-properties-panel-arrow-down' : 'bio-properties-panel-arrow-right'
          })
        })]
      })]
    }), hasItems && jsx(ItemsList, {
      ...restProps,
      autoFocusEntry: autoFocusEntry,
      component: component,
      element: element,
      id: id,
      items: sortedItems,
      newItems: newItems,
      onRemove: onRemove,
      open: open
    })]
  });
}
function ItemsList(props) {
  const {
    autoFocusEntry,
    component: Component,
    element,
    id,
    items,
    newItems,
    onRemove,
    open,
    ...restProps
  } = props;
  const getKey = useKeyFactory();
  const newItem = newItems[0];
  useEffect(() => {
    if (newItem && autoFocusEntry) {
      // (0) select the parent entry (containing all list items)
      const entry = query(`[data-entry-id="${id}"]`);

      // (1) select the first input or a custom element to be focussed
      const selector = typeof autoFocusEntry === 'boolean' ? '.bio-properties-panel-input' : autoFocusEntry;
      const focusableInput = query(selector, entry);

      // (2) set focus
      if (focusableInput) {
        if (isFunction(focusableInput.select)) {
          focusableInput.select();
        } else if (isFunction(focusableInput.focus)) {
          focusableInput.focus();
        }
      }
    }
  }, [newItem, autoFocusEntry, id]);
  return jsx("ol", {
    class: classnames('bio-properties-panel-list-entry-items', open ? 'open' : ''),
    children: items.map((item, index) => {
      const key = getKey(item);
      return jsxs("li", {
        class: "bio-properties-panel-list-entry-item",
        children: [jsx(Component, {
          ...restProps,
          element: element,
          id: id,
          index: index,
          item: item,
          open: item === newItem
        }), onRemove && jsx("button", {
          type: "button",
          title: "Delete item",
          class: "bio-properties-panel-remove-entry bio-properties-panel-remove-list-entry",
          onClick: () => onRemove && onRemove(item),
          children: jsx(DeleteIcon, {})
        })]
      }, key);
    })
  });
}

/**
 * Place new items in the beginning of the list and sort the rest with provided function.
 *
 * @template Item
 * @param {Item[]} currentItems
 * @param {(a: Item, b: Item) => 0 | 1 | -1} [compareFn] function used to sort items
 * @param {boolean} [shouldReset=false] set to `true` to reset state of the hook
 * @returns {Item[]}
 */
function useSortedItems(currentItems, compareFn, shouldReset = false) {
  const itemsRef = useRef(currentItems.slice());

  // (1) Reset and optionally sort.
  if (shouldReset) {
    itemsRef.current = currentItems.slice();
    if (compareFn) {
      itemsRef.current.sort(compareFn);
    }
  } else {
    const items = itemsRef.current;

    // (2) Add new item to the list.
    for (const item of currentItems) {
      if (!items.includes(item)) {
        // Unshift or push depending on whether we have a compareFn
        compareFn ? items.unshift(item) : items.push(item);
      }
    }

    // (3) Filter out removed items.
    itemsRef.current = items.filter(item => currentItems.includes(item));
  }
  return itemsRef.current;
}
function useNewItems(items = [], shouldReset) {
  const previousItems = usePrevious(items.slice()) || [];
  if (shouldReset) {
    return [];
  }
  return previousItems ? items.filter(item => !previousItems.includes(item)) : [];
}

function Select(props) {
  const {
    id,
    label,
    onChange,
    options = [],
    value = '',
    disabled,
    onFocus,
    onBlur,
    tooltip
  } = props;
  const ref = useShowEntryEvent(id);
  const [localValue, setLocalValue] = useState(value);
  const handleChangeCallback = ({
    target
  }) => {
    onChange(target.value);
  };
  const handleChange = e => {
    handleChangeCallback(e);
    setLocalValue(e.target.value);
  };
  useEffect(() => {
    if (value === localValue) {
      return;
    }
    setLocalValue(value);
  }, [value]);
  return jsxs("div", {
    class: "bio-properties-panel-select",
    children: [jsx("label", {
      for: prefixId$3(id),
      class: "bio-properties-panel-label",
      children: jsx(TooltipWrapper, {
        value: tooltip,
        forId: id,
        element: props.element,
        children: label
      })
    }), jsx("select", {
      ref: ref,
      id: prefixId$3(id),
      name: id,
      class: "bio-properties-panel-input",
      onInput: handleChange,
      onFocus: onFocus,
      onBlur: onBlur,
      value: localValue,
      disabled: disabled,
      children: options.map((option, idx) => {
        if (option.children) {
          return jsx("optgroup", {
            label: option.label,
            children: option.children.map((child, idx) => jsx("option", {
              value: child.value,
              disabled: child.disabled,
              children: child.label
            }, idx))
          }, idx);
        }
        return jsx("option", {
          value: option.value,
          disabled: option.disabled,
          children: option.label
        }, idx);
      })
    })]
  });
}

/**
 * @param {object} props
 * @param {object} props.element
 * @param {string} props.id
 * @param {string} [props.description]
 * @param {string} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 * @param {Function} props.getOptions
 * @param {boolean} [props.disabled]
 * @param {Function} [props.validate]
 * @param {string|import('preact').Component} props.tooltip
 */
function SelectEntry(props) {
  const {
    element,
    id,
    description,
    label,
    getValue,
    setValue,
    getOptions,
    disabled,
    onFocus,
    onBlur,
    validate,
    tooltip
  } = props;
  const options = getOptions(element);
  const globalError = useError(id);
  const [localError, setLocalError] = useState(null);
  let value = getValue(element);
  useEffect(() => {
    if (isFunction(validate)) {
      const newValidationError = validate(value) || null;
      setLocalError(newValidationError);
    }
  }, [value]);
  const onChange = newValue => {
    let newValidationError = null;
    if (isFunction(validate)) {
      newValidationError = validate(newValue) || null;
    }
    setValue(newValue, newValidationError);
    setLocalError(newValidationError);
  };
  const error = globalError || localError;
  return jsxs("div", {
    class: classnames('bio-properties-panel-entry', error ? 'has-error' : ''),
    "data-entry-id": id,
    children: [jsx(Select, {
      id: id,
      label: label,
      value: value,
      onChange: onChange,
      onFocus: onFocus,
      onBlur: onBlur,
      options: options,
      disabled: disabled,
      tooltip: tooltip,
      element: element
    }, element), error && jsx("div", {
      class: "bio-properties-panel-error",
      children: error
    }), jsx(Description, {
      forId: id,
      element: element,
      value: description
    })]
  });
}
function isEdited$3(node) {
  return node && !!node.value;
}

// helpers /////////////////

function prefixId$3(id) {
  return `bio-properties-panel-${id}`;
}

function Simple(props) {
  const {
    debounce,
    disabled,
    element,
    getValue,
    id,
    onBlur,
    onFocus,
    setValue
  } = props;
  const value = getValue(element);
  const [localValue, setLocalValue] = useState(value);
  const handleInputCallback = useMemo(() => {
    return debounce(target => setValue(target.value.length ? target.value : undefined));
  }, [setValue, debounce]);
  const handleInput = e => {
    handleInputCallback(e.target);
    setLocalValue(e.target.value);
  };
  useEffect(() => {
    if (value === localValue) {
      return;
    }
    setLocalValue(value);
  }, [value]);
  return jsx("div", {
    class: "bio-properties-panel-simple",
    children: jsx("input", {
      id: prefixId$2(id),
      type: "text",
      name: id,
      spellCheck: "false",
      autoComplete: "off",
      disabled: disabled,
      class: "bio-properties-panel-input",
      onInput: handleInput,
      "aria-label": localValue || '<empty>',
      onFocus: onFocus,
      onBlur: onBlur,
      value: localValue
    }, element)
  });
}
function isEdited$2(node) {
  return node && !!node.value;
}

// helpers /////////////////

function prefixId$2(id) {
  return `bio-properties-panel-${id}`;
}

function resizeToContents(element) {
  element.style.height = 'auto';

  // a 2px pixel offset is required to prevent scrollbar from
  // appearing on OS with a full length scroll bar (Windows/Linux)
  element.style.height = `${element.scrollHeight + 2}px`;
}
function TextArea(props) {
  const {
    id,
    label,
    debounce,
    onInput,
    value = '',
    disabled,
    monospace,
    onFocus,
    onBlur,
    autoResize,
    rows = autoResize ? 1 : 2,
    tooltip
  } = props;
  const [localValue, setLocalValue] = useState(value);
  const ref = useShowEntryEvent(id);
  const handleInputCallback = useMemo(() => {
    return debounce(target => onInput(target.value.length ? target.value : undefined));
  }, [onInput, debounce]);
  const handleInput = e => {
    handleInputCallback(e.target);
    autoResize && resizeToContents(e.target);
    setLocalValue(e.target.value);
  };
  useLayoutEffect(() => {
    autoResize && resizeToContents(ref.current);
  }, []);
  useEffect(() => {
    if (value === localValue) {
      return;
    }
    setLocalValue(value);
  }, [value]);
  return jsxs("div", {
    class: "bio-properties-panel-textarea",
    children: [jsx("label", {
      for: prefixId$1(id),
      class: "bio-properties-panel-label",
      children: jsx(TooltipWrapper, {
        value: tooltip,
        forId: id,
        element: props.element,
        children: label
      })
    }), jsx("textarea", {
      ref: ref,
      id: prefixId$1(id),
      name: id,
      spellCheck: "false",
      class: classnames('bio-properties-panel-input', monospace ? 'bio-properties-panel-input-monospace' : '', autoResize ? 'auto-resize' : ''),
      onInput: handleInput,
      onFocus: onFocus,
      onBlur: onBlur,
      rows: rows,
      value: localValue,
      disabled: disabled,
      "data-gramm": "false"
    })]
  });
}

/**
 * @param {object} props
 * @param {object} props.element
 * @param {string} props.id
 * @param {string} props.description
 * @param {boolean} props.debounce
 * @param {string} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 * @param {number} props.rows
 * @param {boolean} props.monospace
 * @param {Function} [props.validate]
 * @param {boolean} [props.disabled]
 */
function TextAreaEntry(props) {
  const {
    element,
    id,
    description,
    debounce,
    label,
    getValue,
    setValue,
    rows,
    monospace,
    disabled,
    validate,
    onFocus,
    onBlur,
    autoResize,
    tooltip
  } = props;
  const globalError = useError(id);
  const [localError, setLocalError] = useState(null);
  let value = getValue(element);
  useEffect(() => {
    if (isFunction(validate)) {
      const newValidationError = validate(value) || null;
      setLocalError(newValidationError);
    }
  }, [value]);
  const onInput = newValue => {
    let newValidationError = null;
    if (isFunction(validate)) {
      newValidationError = validate(newValue) || null;
    }
    setValue(newValue, newValidationError);
    setLocalError(newValidationError);
  };
  const error = globalError || localError;
  return jsxs("div", {
    class: classnames('bio-properties-panel-entry', error ? 'has-error' : ''),
    "data-entry-id": id,
    children: [jsx(TextArea, {
      id: id,
      label: label,
      value: value,
      onInput: onInput,
      onFocus: onFocus,
      onBlur: onBlur,
      rows: rows,
      debounce: debounce,
      monospace: monospace,
      disabled: disabled,
      autoResize: autoResize,
      tooltip: tooltip,
      element: element
    }, element), error && jsx("div", {
      class: "bio-properties-panel-error",
      children: error
    }), jsx(Description, {
      forId: id,
      element: element,
      value: description
    })]
  });
}
function isEdited$1(node) {
  return node && !!node.value;
}

// helpers /////////////////

function prefixId$1(id) {
  return `bio-properties-panel-${id}`;
}

function Textfield(props) {
  const {
    debounce,
    disabled = false,
    id,
    label,
    onInput,
    onFocus,
    onBlur,
    value = '',
    tooltip
  } = props;
  const [localValue, setLocalValue] = useState(value || '');
  const ref = useShowEntryEvent(id);
  const handleInputCallback = useMemo(() => {
    return debounce(target => onInput(target.value.length ? target.value : undefined));
  }, [onInput, debounce]);
  const handleInput = e => {
    handleInputCallback(e.target);
    setLocalValue(e.target.value);
  };
  useEffect(() => {
    if (value === localValue) {
      return;
    }
    setLocalValue(value);
  }, [value]);
  return jsxs("div", {
    class: "bio-properties-panel-textfield",
    children: [jsx("label", {
      for: prefixId(id),
      class: "bio-properties-panel-label",
      children: jsx(TooltipWrapper, {
        value: tooltip,
        forId: id,
        element: props.element,
        children: label
      })
    }), jsx("input", {
      ref: ref,
      id: prefixId(id),
      type: "text",
      name: id,
      spellCheck: "false",
      autoComplete: "off",
      disabled: disabled,
      class: "bio-properties-panel-input",
      onInput: handleInput,
      onFocus: onFocus,
      onBlur: onBlur,
      value: localValue
    })]
  });
}

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.description
 * @param {Boolean} props.debounce
 * @param {Boolean} props.disabled
 * @param {String} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 * @param {string|import('preact').Component} props.tooltip
 * @param {Function} props.validate
 */
function TextfieldEntry(props) {
  const {
    element,
    id,
    description,
    debounce,
    disabled,
    label,
    getValue,
    setValue,
    validate,
    onFocus,
    onBlur,
    tooltip
  } = props;
  const globalError = useError(id);
  const [localError, setLocalError] = useState(null);
  let value = getValue(element);
  useEffect(() => {
    if (isFunction(validate)) {
      const newValidationError = validate(value) || null;
      setLocalError(newValidationError);
    }
  }, [value]);
  const onInput = newValue => {
    let newValidationError = null;
    if (isFunction(validate)) {
      newValidationError = validate(newValue) || null;
    }
    setValue(newValue, newValidationError);
    setLocalError(newValidationError);
  };
  const error = globalError || localError;
  return jsxs("div", {
    class: classnames('bio-properties-panel-entry', error ? 'has-error' : ''),
    "data-entry-id": id,
    children: [jsx(Textfield, {
      debounce: debounce,
      disabled: disabled,
      id: id,
      label: label,
      onInput: onInput,
      onFocus: onFocus,
      onBlur: onBlur,
      value: value,
      tooltip: tooltip,
      element: element
    }, element), error && jsx("div", {
      class: "bio-properties-panel-error",
      children: error
    }), jsx(Description, {
      forId: id,
      element: element,
      value: description
    })]
  });
}
function isEdited(node) {
  return node && !!node.value;
}

// helpers /////////////////

function prefixId(id) {
  return `bio-properties-panel-${id}`;
}

const DEFAULT_DEBOUNCE_TIME = 300;
function debounceInput(debounceDelay) {
  return function _debounceInput(fn) {
    if (debounceDelay !== false) {
      var debounceTime = isNumber(debounceDelay) ? debounceDelay : DEFAULT_DEBOUNCE_TIME;
      return debounce(fn, debounceTime);
    } else {
      return fn;
    }
  };
}
debounceInput.$inject = ['config.debounceInput'];

var index$1 = {
  debounceInput: ['factory', debounceInput]
};

class FeelPopupModule {
  constructor(eventBus) {
    this._eventBus = eventBus;
  }

  /**
   * Check if the FEEL popup is open.
   * @return {Boolean}
   */
  isOpen() {
    return this._eventBus.fire('feelPopup._isOpen');
  }

  /**
   * Open the FEEL popup.
   *
   * @param {String} entryId
   * @param {Object} popupConfig
   * @param {HTMLElement} sourceElement
   */
  open(entryId, popupConfig, sourceElement) {
    return this._eventBus.fire('feelPopup._open', {
      entryId,
      popupConfig,
      sourceElement
    });
  }

  /**
   * Close the FEEL popup.
   */
  close() {
    return this._eventBus.fire('feelPopup._close');
  }
}
FeelPopupModule.$inject = ['eventBus'];

var index = {
  feelPopup: ['type', FeelPopupModule]
};

export { ArrowIcon, CheckboxEntry, CollapsibleEntry, CreateIcon, index$1 as DebounceInputModule, DeleteIcon, DescriptionContext, Description as DescriptionEntry, DragIcon, DropdownButton, ErrorsContext, EventContext, ExternalLinkIcon, FeelCheckboxEntry, FeelEntry, FeelIcon$1 as FeelIcon, FeelNumberEntry, index as FeelPopupModule, FeelTemplatingEntry, FeelTextAreaEntry, FeelToggleSwitchEntry, Group, Header, HeaderButton, HelpIcon, LayoutContext, List as ListEntry, ListGroup, ListItem, NumberFieldEntry, Placeholder, Popup, PopupIcon, PropertiesPanel, LayoutContext as PropertiesPanelContext, SelectEntry, Simple as SimpleEntry, TemplatingEntry, TextAreaEntry, TextfieldEntry as TextFieldEntry, ToggleSwitchEntry, TooltipContext, isEdited$5 as isCheckboxEntryEdited, isEdited$6 as isFeelEntryEdited, isEdited$7 as isNumberFieldEntryEdited, isEdited$3 as isSelectEntryEdited, isEdited$2 as isSimpleEntryEdited, isEdited$4 as isTemplatingEntryEdited, isEdited$1 as isTextAreaEntryEdited, isEdited as isTextFieldEntryEdited, isEdited$8 as isToggleSwitchEntryEdited, useDescriptionContext, useError, useErrors, useEvent, useKeyFactory, useLayoutState, usePrevious, useShowEntryEvent, useStaticCallback, useStickyIntersectionObserver, useTooltipContext };
//# sourceMappingURL=index.esm.js.map
