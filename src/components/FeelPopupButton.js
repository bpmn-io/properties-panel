import { PopupIcon } from '../components/icons';

/**
 * A reusable button component for opening popups.
 *
 * @param {Object} props
 * @param {Function} props.onClick - Callback to trigger when the button is clicked.
 * @param {string} [props.title] - Tooltip text for the button.
 * @param {boolean} [props.disabled] - Whether the button is disabled.
 * @param {string} [props.className] - Additional class names for the button.
 */
export function FeelPopupButton({
  onClick,
  title = 'Open pop-up editor',
}) {
  return (
    <button
      type="button"
      title={ title }
      class={ 'bio-properties-panel-open-feel-popup' }
      onClick={ onClick }
    >
      <PopupIcon />
    </button>
  );
}
