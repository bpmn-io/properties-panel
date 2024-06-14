import {
  useEffect
} from 'preact/hooks';

import {
  query as domQuery
} from 'min-dom';

import { isFunction } from 'min-dash';

import CollapsibleEntry from './entries/Collapsible';
import translateFallback from './util/translateFallback';

/**
 * @param {import('../PropertiesPanel').ListItemDefinition} props
 */
export default function ListItem(props) {
  const {
    autoFocusEntry,
    autoOpen,
    translate = translateFallback
  } = props;

  // focus specified entry on auto open
  useEffect(() => {
    if (autoOpen && autoFocusEntry) {
      const entry = domQuery(`[data-entry-id="${autoFocusEntry}"]`);

      const focusableInput = domQuery('.bio-properties-panel-input', entry);

      if (focusableInput) {

        if (isFunction(focusableInput.select)) {
          focusableInput.select();
        } else if (isFunction(focusableInput.focus)) {
          focusableInput.focus();
        }

        focusableInput.scrollIntoView();
      }
    }
  }, [ autoOpen, autoFocusEntry ]);


  return (
    <div class="bio-properties-panel-list-item">
      <CollapsibleEntry
        { ...props }
        open={ autoOpen }
        translate={ translate }
      />
    </div>
  );

}
