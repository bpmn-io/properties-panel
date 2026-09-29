import classnames from 'classnames';

import Tooltip, { TOOLTIP_ID } from './Tooltip';

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
      <span class={ classnames('bio-properties-panel-error-message', 'bio-properties-panel-diagnostic-message') }>{ message }</span>
      { action && (
        <Tooltip
          value={ action.tooltip }
          forId={ `${ forId }-diagnostic-action` }
          element={ element }
          focusable={ false }
        >
          <button
            type="button"
            id={ prefixId(`${ forId }-diagnostic-action`) }
            class={ classnames('bio-properties-panel-error-action', 'bio-properties-panel-diagnostic-action') }
            onClick={ action.onClick }
            aria-describedby={ action.tooltip ? TOOLTIP_ID : undefined }
          >
            { action.label }
          </button>
        </Tooltip>
      ) }
    </div>
  );
}


// helpers /////////////////

function prefixId(id) {
  return `bio-properties-panel-${ id }`;
}
