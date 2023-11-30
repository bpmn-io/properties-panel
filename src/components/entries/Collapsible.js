import {
  useCallback,
  useContext,
  useEffect,
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

  const { onShow } = useContext(PropertiesPanelContext);

  const [ open, setOpen ] = useState(shouldOpen);

  useEffect(() => {
    if (shouldOpen) {
      setOpen(shouldOpen);
    }
  }, [ shouldOpen ]);

  const toggleOpen = useCallback(() => setOpen(!open), [ open ]);

  console.log('CollapsibleEntry', {
    shouldOpen,
    open
  });

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

  console.log('RENDER', open, props);

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