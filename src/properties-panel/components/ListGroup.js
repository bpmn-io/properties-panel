import {
  useState
} from 'preact/hooks';

export default function ListGroup(props) {
  const {
    id,
    children,
    label,
    add: AddComponent
  } = props;

  const [ open, setOpen ] = useState(false);

  const toggleOpen = () => setOpen(!open);

  return <div class="bio-properties-panel-group" id={ 'group-' + id }>
    <div class="bio-properties-panel-group-header" onClick={ toggleOpen }>
      <div class={ 'bio-properties-panel-group-header-title' + (!children.length ? '-no-content' : '') }>
        { label }
      </div>
      <AddComponent />
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