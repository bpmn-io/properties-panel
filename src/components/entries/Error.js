import { isString } from 'min-dash';

import Tooltip from './Tooltip';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

/**
 * @typedef {Object} ErrorAction
 * @property {String} label - label of the action button
 * @property {String} [tooltip] - tooltip shown on hover/focus of the action button
 * @property {Function} onClick - callback invoked when the action is triggered
 */

/**
 * @param {Object} props
 * @param {String|{ message: String, action?: ErrorAction }} props.error
 * @param {String} props.forId - id of the entry the error belongs to
 * @param {Object} [props.element]
 */
export default function ErrorMessage(props) {
  const { error, forId, element } = props;

  if (!error) {
    return null;
  }

  const message = isString(error) ? error : error.message;
  const action = isString(error) ? null : error.action;

  return (
    <div class="bio-properties-panel-error">
      <span class="bio-properties-panel-error-message">{ message }</span>
      { action && (
        <Tooltip
          value={ action.tooltip }
          forId={ `${ forId }-error-action` }
          element={ element }
        >
          <button
            type="button"
            class="bio-properties-panel-error-action"
            onClick={ action.onClick }
          >
            { action.label }
          </button>
        </Tooltip>
      ) }
    </div>
  );
}
