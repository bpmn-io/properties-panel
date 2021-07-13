import {
  useEffect,
  useState
} from 'preact/hooks';

import classnames from 'classnames';

import {
  query as domQuery
} from 'min-dom';

import {
  isFunction
} from 'min-dash';

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

  const [ edited, setEdited ] = useState(false);

  // set edited state depending on all entries
  useEffect(() => {
    const hasOneEditedEntry = entries.find(entry => {
      const {
        id,
        isEdited
      } = entry;

      const entryNode = domQuery(`[data-entry-id="${id}"]`);

      if (!isFunction(isEdited) || !entryNode) {
        return false;
      }

      const inputNode = domQuery('.bio-properties-panel-input', entryNode);

      return isEdited(inputNode);
    });

    setEdited(hasOneEditedEntry);
  }, [ entries ]);

  return <div class="bio-properties-panel-group" data-group-id={ 'group-' + id }>
    <div class={ classnames(
      'bio-properties-panel-group-header',
      edited ? '' : 'empty'
    ) } onClick={ toggleOpen }>
      <div title={ getTitleAttribute(label, edited) } class="bio-properties-panel-group-header-title">
        { label }
      </div>
      <div class="bio-properties-panel-group-header-buttons">
        {
          edited && <DataMarker />
        }
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

function DataMarker() {
  return (
    <div class="bio-properties-panel-dot">
      <svg
        aria-label="edited" role="img" xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
      >
        <circle fill="currentColor" cx="50" cy="50" r="50" />
      </svg>
    </div>
  );
}


// helper //////////////

function getTitleAttribute(label, edited) {
  return label + (edited ? ' (edited)' : '');
}