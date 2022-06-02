import classNames from 'classnames';
import { useRef } from 'preact/hooks';

export function FeelToggle(props) {

  const ref = useRef();

  const {
    disabled,
    active,
    onClick
  } = props;

  return <button
    disabled={ disabled }
    onClick={ onClick }
    ref={ ref }
    class={ classNames(disabled && 'disabled', active && 'active') }>=</button>;
}