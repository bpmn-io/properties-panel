import {
  useLayoutEffect
} from 'preact/hooks';

import {
  query as domQuery
} from 'min-dom';

import { isFunction } from 'min-dash';

import CollapsibleEntry from './entries/Collapsible';

/**
 * @param {import('../PropertiesPanel').ListItemDefinition} props
 */
export default function ListItem(props) {
  const {
    autoFocusEntry,
    autoOpen
  } = props;

  // focus specified entry on auto open
  useLayoutEffect(() => {

    console.log({
      props,
      autoOpen,
      autoFocusEntry
    });

    if (autoOpen && autoFocusEntry) {
      const entry = domQuery(`[data-entry-id="${autoFocusEntry}"]`);

      const focusableInput = domQuery('.bio-properties-panel-input', entry);

      console.log('FOCUS!', props, entry, focusableInput);

      if (focusableInput) {

        if (isFunction(focusableInput.select)) {
          focusableInput.select();
        } else if (isFunction(focusableInput.focus)) {
          focusableInput.focus();
        }

      }
    }
  }, [ autoOpen, autoFocusEntry ]);

  console.log('ListItem', { autoOpen });

  return (
    <div class="bio-properties-panel-list-item">
      <CollapsibleEntry
        { ...props }
        open={ autoOpen } />
    </div>
  );

}
