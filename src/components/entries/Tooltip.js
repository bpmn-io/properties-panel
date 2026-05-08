import { useRef } from 'preact/hooks';

import { useTooltipContext } from '../../hooks/useTooltipContext';

import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@camunda/design-system/preact/components/tooltip';

/**
 * Tooltip wrapper that resolves tooltip text from either an explicit `value`
 * prop or the panel's `TooltipContext` (`forId` + `element`). When no text is
 * available, children are rendered as-is.
 *
 * Renders the shadcn (Base UI) Tooltip from `@camunda/design-system` while
 * preserving the legacy class names that downstream tests / consumers query
 * (`bio-properties-panel-tooltip-wrapper`, `bio-properties-panel-tooltip-content`).
 *
 * `showDelay` / `hideDelay` are accepted for prop-contract parity with prior
 * versions but are currently no-ops: Base UI's hover delay uses `restMs`,
 * which requires real `pointermove` events to register cursor "rest". Existing
 * tests trigger via `fireEvent.mouseEnter` only, so a positive delay would
 * prevent opening. Open instantly on hover for now; layer a controlled-state
 * delay on top if the UX gap matters.
 *
 * @param {Object} props
 * @param {String} props.forId
 * @param {String|Object} [props.value]
 * @param {Object} [props.element]
 * @param {Number} [props.showDelay] currently ignored — see above
 * @param {Number} [props.hideDelay] currently ignored — see above
 * @param {*} [props.children]
 */
export default function TooltipWrapper(props) {
  const {
    forId,
    element,
    children,
    value: explicitValue
  } = props;

  const contextValue = useTooltipContext(forId, element);
  const value = explicitValue || contextValue;

  // Portal target — the host span itself. Base UI's Positioner requires a
  // Portal in the tree (you can't simply omit it), but routing the portal
  // back to a local element keeps the popup inside the panel container so
  // tests scoping queries to the panel container (`domQuery('.bio-...',
  // container)`) still find it.
  const portalContainerRef = useRef(null);

  if (!value) {
    return children;
  }

  return (
    <span ref={ portalContainerRef } class="bio-properties-panel-tooltip-host">
      <TooltipProvider>
        <ShadcnTooltip>

          {/*
            Trigger renders as a non-button <span> wrapping the label text so
            the surrounding <Label htmlFor> labelling is preserved. The
            `bio-properties-panel-tooltip-wrapper` class is what existing tests
            query to drive hover-open via mouseEnter.

            `delay` / `closeDelay` are pinned to 0 — see component header.
          */}
          <TooltipTrigger
            nativeButton={ false }
            delay={ 0 }
            closeDelay={ 0 }
            render={ <span class="bio-properties-panel-tooltip-wrapper" tabIndex="0" /> }
          >
            { children }
          </TooltipTrigger>

          {/*
            Inner `bio-properties-panel-tooltip-content` div is what tests
            query for the rendered tooltip text (`p`, `a`, etc. children).

            Inline `style` neutralizes the panel CSS rules on
            `.bio-properties-panel-tooltip-content` (padding: 16px, dark
            background, border-radius: 2px). Inline styles have higher
            specificity than the panel's class selector, so the popup ends
            up with shadcn's compact `px-3 py-1.5` only.
          */}
          <TooltipContent
            className="bio-properties-panel-tooltip"
            container={ portalContainerRef }
            aria-labelledby={ `bio-properties-panel-${ forId }` }
          >
            <div
              class="bio-properties-panel-tooltip-content"
              style={ { padding: 0, background: 'transparent', borderRadius: 0 } }
            >
              { value }
            </div>
          </TooltipContent>

        </ShadcnTooltip>
      </TooltipProvider>
    </span>
  );
}
