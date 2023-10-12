import classnames from 'classnames';

export function HeaderButton(props) {
  const {
    children = null,
    class: classname,
    onClick = () => {},
    ...otherProps
  } = props;

  return <button
    type="button"
    { ...otherProps }
    onClick={ onClick }
    class={ classnames('bio-properties-panel-group-header-button', classname) }>
    { children }
  </button>;
}
