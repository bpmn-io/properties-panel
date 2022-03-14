import { FeelOptionalIcon, FeelRequiredIcon } from '../icons';

/**
 * @param {Object} props
 * @param {Object} props.label
 * @param {String} props.feel
 */
export default function FeelIcon(props) {

  const {
    label,
    feel = false,
  } = props;

  const feelRequiredLabel = ' must be a FEEL expression';
  const feelOptionalLabel = ' can optionally be a FEEL expression';

  return (
    <i
      class="bio-properties-panel-feel-icon"
      title={
        label + (
          feel === 'required' ? feelRequiredLabel : feelOptionalLabel
        )
      }
    >
      {feel === 'required' ? <FeelRequiredIcon /> : <FeelOptionalIcon />}
    </i>
  );
}