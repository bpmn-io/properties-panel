import classNames from 'classnames';
import { FeelIcon as FeelIconSvg } from '../../icons';

import translateFallback from '../../util/translateFallback';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

const noop = () => {};

/**
 * @param {Object} props
 * @param {Object} props.label
 * @param {String} props.feel
 * @param {boolean} props.active
 * @param {boolean} props.disabled
 * @param {Function} props.onClick
 * @param {Function} props.translate
 * @returns {import('preact').Component}
 */
export default function FeelIcon(props) {

  const {
    feel = false,
    active,
    disabled = false,
    onClick = noop,
    translate = translateFallback
  } = props;

  const feelRequiredLabel = translate('FEEL expression is mandatory');
  const feelOptionalLabel = translate(`Click to ${active ? 'remove' : 'set a'} dynamic value with FEEL expression`);

  const handleClick = e => {
    onClick(e);

    // when pointer event was created from keyboard, keep focus on button
    if (!e.pointerType) {
      e.stopPropagation();
    }
  };

  return (
    <button
      type="button"
      class={ classNames('bio-properties-panel-feel-icon',
        active ? 'active' : null,
        feel === 'required' ? 'required' : 'optional') }
      onClick={ handleClick }
      disabled={ feel === 'required' || disabled }
      title={
        feel === 'required' ? feelRequiredLabel : feelOptionalLabel
      }
    >
      <FeelIconSvg />
    </button>
  );
}