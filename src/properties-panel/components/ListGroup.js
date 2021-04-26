import {
  useState
} from 'preact/hooks';

import classnames from 'classnames';

import ListItem from './ListItem';

import PlusIcon from '../../icons/Plus.svg';


/**
 * @param {import('../PropertiesPanel').ListGroupDefinition} props
 */
export default function ListGroup(props) {
  const {
    id,
    items = [],
    label,
    add: AddContainer
  } = props;

  const [ open, setOpen ] = useState(false);

  const toggleOpen = () => setOpen(!open);

  return <div class="bio-properties-panel-group" data-group-id={ 'group-' + id }>
    <div class="bio-properties-panel-group-header" onClick={ toggleOpen }>
      <div class="bio-properties-panel-group-header-title">
        { label }
      </div>
      <AddContainer>
        <PlusIcon width="16" height="16" class="bio-properties-panel-plus" />
      </AddContainer>
    </div>
    <div class={ classnames(
      'bio-properties-panel-list',
      open ? 'open' : ''
    ) }>
      {
        items.map(item => {
          return (
            <ListItem { ...item } />
          );
        })
      }
    </div>
  </div>;
}