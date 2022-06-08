import classNames from 'classnames';
import { useRef } from 'preact/hooks';

export function FeelToggle(props) {

  const ref = useRef();

  const {
    disabled,
    active,
    onClick
  } = props;

  let dataText;

  if (disabled) {
    dataText = 'Property must be a Feel expression';
  } else if (active) {
    dataText = 'Property is a FEEL expression, click to disable FEEL';
  } else {
    dataText = 'Property can be a Feel expression, click to enable FEEL';
  }

  // if (!active) {
  //   return null;
  // }

  return <span class="FeelToggle tooltip">
    <div class="tooltip-container"><span class="tooltip-content">{ dataText }</span></div>
    <button
      disabled={ disabled }
      onClick={ onClick }
      ref={ ref }
      class={ classNames(disabled && 'disabled', active && 'active') }
    >=</button>
  </span>;
}