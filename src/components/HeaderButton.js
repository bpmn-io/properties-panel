import classnames from 'classnames';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

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
