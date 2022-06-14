import classNames from 'classnames';
import { FeelOptionalIcon, FeelRequiredIcon } from '../../icons';

const noop = () => {};

/**
 * @param {Object} props
 * @param {Object} props.label
 * @param {String} props.feel
 */
export default function FeelIcon(props) {

  const {
    label,
    feel = false,
    active,
    disabled = false,
    onClick = noop
  } = props;

  const feelRequiredLabel = ' must be a FEEL expression';
  const feelOptionalLabel = ' can optionally be a FEEL expression';

  const handleClick = e => {
    onClick(e);

    // when pointer event was created from keyboard, keep focus on button
    if (!e.pointerType) {
      e.stopPropagation();
    }
  };

  return (
    <button
      class={ classNames('bio-properties-panel-feel-icon',
        active ? 'active' : null,
        feel === 'required' ? 'required' : 'optional') }
      onClick={ handleClick }
      disabled={ feel === 'required' || disabled }
      title={
        label + (
          feel === 'required' ? feelRequiredLabel : feelOptionalLabel
        )
      }
    >
      {feel === 'required' ? <FeelRequiredIcon /> : <FeelOptionalIcon />}
    </button>
  );
}