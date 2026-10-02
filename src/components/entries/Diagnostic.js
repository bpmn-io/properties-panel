import classnames from 'classnames';

import { useEffect, useRef } from 'preact/hooks';

import Tooltip, { TOOLTIP_ID } from './Tooltip';
import { InfoIcon } from '../icons';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

const SEVERITY_CLASS = {
  error: 'bio-properties-panel-error',
  warning: 'bio-properties-panel-warning',
  info: 'bio-properties-panel-info'
};

/**
 * @param {Object} props
 * @param {import('../util/diagnostics').Diagnostic} [props.diagnostic]
 * @param {String} props.forId - id of the entry the diagnostic belongs to
 * @param {Object} [props.element]
 */
export default function DiagnosticMessage(props) {
  const { diagnostic, forId, element } = props;

  if (!diagnostic) {
    return null;
  }

  const { action, message, severity } = diagnostic;

  return (
    <div class={ SEVERITY_CLASS[ severity ] }>
      <span class={ classnames('bio-properties-panel-error-message', 'bio-properties-panel-diagnostic-message') }>
        { severity === 'info' && (
          <InfoIcon class="bio-properties-panel-diagnostic-icon" aria-hidden="true" />
        ) }
        { message }
      </span>
      { action && <DiagnosticAction action={ action } forId={ forId } element={ element } /> }
    </div>
  );
}


function DiagnosticAction(props) {
  const { action, forId, element } = props;

  const buttonRef = useRef();

  // restore focus to the field once the focused action goes away
  useEffect(() => {
    return () => {
      const button = buttonRef.current;

      if (button && button === document.activeElement) {
        const field = document.getElementById(prefixId(forId));

        field && field.focus();
      }
    };
  }, [ forId ]);

  return (
    <Tooltip
      value={ action.tooltip }
      forId={ `${ forId }-diagnostic-action` }
      element={ element }
      focusable={ false }
    >
      <button
        type="button"
        ref={ buttonRef }
        id={ prefixId(`${ forId }-diagnostic-action`) }
        class={ classnames('bio-properties-panel-error-action', 'bio-properties-panel-diagnostic-action') }
        onClick={ action.onClick }
        aria-label={ action.ariaLabel }
        aria-describedby={ action.tooltip ? TOOLTIP_ID : undefined }
      >
        { action.label }
      </button>
    </Tooltip>
  );
}


// helpers /////////////////

function prefixId(id) {
  return `bio-properties-panel-${ id }`;
}
