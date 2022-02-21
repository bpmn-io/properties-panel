import {
  useState
} from 'preact/hooks';

import classnames from 'classnames';

import {
  ArrowIcon,
  DeleteIcon,
} from '../icons';


export default function CollapsibleEntry(props) {
  const {
    element,
    entries = [],
    id,
    label,
    open: shouldOpen,
    remove
  } = props;

  const [ open, setOpen ] = useState(shouldOpen);

  const toggleOpen = () => setOpen(!open);

  // todo(pinussilvestrus): translate once we have a translate mechanism for the core
  const placeholderLabel = '<empty>';

  return (
    <div
      data-entry-id={ id }
      class={ classnames(
        'bio-properties-panel-collapsible-entry',
        open ? 'open' : ''
      ) }>
      <div class="bio-properties-panel-collapsible-entry-header" onClick={ toggleOpen }>
        <div
          title={ label || placeholderLabel }
          class={ classnames(
            'bio-properties-panel-collapsible-entry-header-title',
            !label && 'empty'
          ) }>
          { label || placeholderLabel }
        </div>
        <button
          title="Toggle list item"
          class="bio-properties-panel-arrow  bio-properties-panel-collapsible-entry-arrow"
        >
          <ArrowIcon class={ open ? 'bio-properties-panel-arrow-down' : 'bio-properties-panel-arrow-right' } />
        </button>
        {
          remove
            ?
            (
              <button title="Delete item" class="bio-properties-panel-remove-entry" onClick={ remove }>
                <DeleteIcon />
              </button>
            )
            : null
        }
      </div>
      <div class={ classnames(
        'bio-properties-panel-collapsible-entry-entries',
        open ? 'open' : ''
      ) }>
        {
          entries.map(entry => {
            const {
              component: Component,
              id
            } = entry;

            return <Component
              { ...entry }
              key={ id }
              element={ element } />;
          })
        }
      </div>
    </div>
  );
}