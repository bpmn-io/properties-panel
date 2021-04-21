import {
  useState
} from 'preact/hooks';

import ChevronIcon from '../../icons/Chevron.svg';


export default function Group(props) {
  const {
    id,
    children,
    label
  } = props;

  const [ open, setOpen ] = useState(false);

  const toggleOpen = () => setOpen(!open);

  return <div class="bio-properties-panel-group" id={ 'group-' + id }>
    <div class="bio-properties-panel-group-header" onClick={ toggleOpen }>
      <div class={ 'bio-properties-panel-group-header-title' + (!children.length ? '-no-content' : '') }>
        { label }
      </div>
      <ChevronIcon width="16" height="16" class={ open ? 'bio-properties-panel-chevron-down' : 'bio-properties-panel-chevron-right' } />
    </div>
    {
      open
        ? (
          <div class="bio-properties-panel-group-entries">
            {
              children
            }
          </div>
        )
        : null
    }
  </div>;
}