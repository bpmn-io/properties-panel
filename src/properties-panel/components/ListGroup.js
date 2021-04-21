import {
  useState
} from 'preact/hooks';

import PlusIcon from '../../icons/Plus.svg';


export default function ListGroup(props) {
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
      <PlusIcon width="16" height="16" class="bio-properties-panel-plus" />
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