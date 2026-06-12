import { OpenPopupIcon } from './icons';

import translateFallback from './util/translateFallback';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

/**
 * Button to open popups.
 *
 * @param {Object} props
 * @param {Function} props.onClick - Callback to trigger when the button is clicked.
 * @param {string} [props.title] - Tooltip text for the button.
 * @param {Function} [props.translate] - Translation function for built-in strings.
 */
export function OpenPopupButton({
  onClick,
  title,
  translate = translateFallback,
}) {
  title = title ?? translate('Open pop-up editor');
  return (
    <button
      type="button"
      title={ title }
      class={ 'bio-properties-panel-open-feel-popup' }
      onClick={ onClick }
    >
      <OpenPopupIcon />
    </button>
  );
}
