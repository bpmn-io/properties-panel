import {
  useCallback,
  useContext,
  useState
} from 'preact/hooks';

import classnames from 'classnames';

import { isFunction } from 'min-dash';

import {
  ArrowIcon,
  DeleteIcon,
} from '../icons';

import { PropertiesPanelContext } from '../../context';


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

  const { onShow } = useContext(PropertiesPanelContext);

  const propertiesPanelContext = {
    ...useContext(PropertiesPanelContext),
    onShow: useCallback(() => {
      setOpen(true);

      if (isFunction(onShow)) {
        onShow();
      }
    }, [ onShow, setOpen ])
  };

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
          type="button"
          title="Toggle list item"
          class="bio-properties-panel-arrow  bio-properties-panel-collapsible-entry-arrow"
        >
          <ArrowIcon class={ open ? 'bio-properties-panel-arrow-down' : 'bio-properties-panel-arrow-right' } />
        </button>
        {
          remove
            ?
            (
              <button type="button" title="Delete item" class="bio-properties-panel-remove-entry" onClick={ remove }>
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
        <PropertiesPanelContext.Provider value={ propertiesPanelContext }>
          {
            entries.map(entry => {
              const {
                component: Component,
                id
              } = entry;

              return (
                <Component
                  { ...entry }
                  element={ element }
                  key={ id } />
              );
            })
          }
        </PropertiesPanelContext.Provider>
      </div>
    </div>
  );
}