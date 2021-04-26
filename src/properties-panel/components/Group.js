import {
  useState
} from 'preact/hooks';

import classnames from 'classnames';

import ChevronIcon from '../../icons/Chevron.svg';

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
      <div class="bio-properties-panel-group-header-title">
        { label }
      </div>
      <ChevronIcon width="16" height="16" class={ open ? 'bio-properties-panel-chevron-down' : 'bio-properties-panel-chevron-right' } />
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