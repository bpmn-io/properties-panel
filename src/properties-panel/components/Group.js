import {
  useState
} from 'preact/hooks';

import classnames from 'classnames';

import { GroupArrowIcon } from './icons';

/**
 * @param {import('../PropertiesPanel').GroupDefinition} props
 */
export default function Group(props) {
  const {
    id,
    entries = [],
    label
  } = props;

  const [ open, setOpen ] = useState(false);

  const toggleOpen = () => setOpen(!open);

  return <div class="bio-properties-panel-group" data-group-id={ 'group-' + id }>
    <div class="bio-properties-panel-group-header" onClick={ toggleOpen }>
      <div title={ label } class="bio-properties-panel-group-header-title">
        { label }
      </div>
      <div class="bio-properties-panel-group-header-buttons">
        <div class="bio-properties-panel-group-header-button">
          <GroupArrowIcon class={ open ? 'bio-properties-panel-arrow-down' : 'bio-properties-panel-arrow-right' } />
        </div>
      </div>
    </div>
    <div class={ classnames(
      'bio-properties-panel-group-entries',
      open ? 'open' : ''
    ) }>
      {
        entries.map(e => e.component)
      }
    </div>
  </div>;
}