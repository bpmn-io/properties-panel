import {
  useState
} from 'preact/hooks';

import classnames from 'classnames';

import {
  ListArrowIcon,
  ListDeleteIcon,
} from '../icons';


export default function CollapsibleEntry(props) {
  const {
    id,
    entries = [],
    label,
    remove: RemoveContainer,
    open: shouldOpen
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
          class={ classnames(
            'bio-properties-panel-collapsible-entry-header-title',
            !label && 'empty'
          ) }>
          { label || placeholderLabel }
        </div>
        <div class="bio-properties-panel-collapsible-entry-arrow">
          <ListArrowIcon class={ open ? 'bio-properties-panel-arrow-down' : 'bio-properties-panel-arrow-right' } />
        </div>
        {
          RemoveContainer
            ?
            (
              <RemoveContainer>
                <button class="bio-properties-panel-remove-entry">
                  <ListDeleteIcon />
                </button>
              </RemoveContainer>
            )
            : null
        }
      </div>
      <div class={ classnames(
        'bio-properties-panel-collapsible-entry-entries',
        open ? 'open' : ''
      ) }>
        {
          entries.map(e => e.component)
        }
      </div>
    </div>
  );
}