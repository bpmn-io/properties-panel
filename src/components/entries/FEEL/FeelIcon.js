import classNames from 'classnames';
import { FeelIcon as FeelIconSvg } from '../../icons';

const noop = () => {};

/**
 * @param {Object} props
 * @param {Object} props.label
 * @param {String} props.feel
 */
export default function FeelIcon(props) {

  const {
    feel = false,
    active,
    disabled = false,
    onClick = noop
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