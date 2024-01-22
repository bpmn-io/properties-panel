import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'preact/hooks';

import { FeelPopupContext } from './context';

import { usePrevious } from '../../../hooks';

import { Popup } from '../../Popup';

import CodeEditor from './FeelEditor';

import TemplatingEditor from '../templating/TemplatingEditor';
import { HelpIcon } from '../../icons';

export const FEEL_POPUP_WIDTH = 700;
export const FEEL_POPUP_HEIGHT = 250;


/**
 * FEEL popup component, built as a singleton. Emits lifecycle events as follows:
 *  - `feelPopup.open` - fired before the popup is mounted
 *  - `feelPopup.opened` - fired after the popup is mounted. Event context contains the DOM node of the popup
 *  - `feelPopup.close` - fired before the popup is unmounted. Event context contains the DOM node of the popup
 *  - `feelPopup.closed` - fired after the popup is unmounted
 */
export default function FEELPopupRoot(props) {
  const {
    element,
    eventBus = { fire() {}, on() {}, off() {} },
    popupContainer
  } = props;

  const prevElement = usePrevious(element);

  const [ popupConfig, setPopupConfig ] = useState({});
  const [ open, setOpen ] = useState(false);
  const [ source, setSource ] = useState(null);
  const [ sourceElement, setSourceElement ] = useState(null);

  const emit = (type, context) => {
    eventBus.fire('feelPopup.' + type, context);
  };

  const isOpen = useCallback(() => {
    return !!open;
  }, [ open ]);

  useUpdateEffect(() => {
    if (!open) {
      emit('closed');
    }
  }, [ open ]);

  const handleOpen = (entryId, config, _sourceElement) => {
    setSource(entryId);
    setPopupConfig(config);
    setOpen(true);
    setSourceElement(_sourceElement);
    emit('open');
  };

  const handleClose = (event = { }) => {
    const { id } = event;
    if (id && id !== source) {
      return;
    }

    setOpen(false);
    setSource(null);
  };

  const feelPopupContext = {
    open: handleOpen,
    close: handleClose,
    source
  };

  // close popup on element change, cf. https://github.com/bpmn-io/properties-panel/issues/270
  useEffect(() => {
    if (element && prevElement && element !== prevElement) {
      handleClose();
    }
  }, [ element ]);

  // allow close and open via events
  useEffect(() => {

    const handlePopupOpen = (context) => {
      const {
        entryId,
        popupConfig,
        sourceElement
      } = context;

      handleOpen(entryId, popupConfig, sourceElement);
    };

    const handleIsOpen = () => {
      return isOpen();
    };

    eventBus.on('feelPopup._close', handleClose);
    eventBus.on('feelPopup._open', handlePopupOpen);
    eventBus.on('feelPopup._isOpen', handleIsOpen);

    return () => {
      eventBus.off('feelPopup._close', handleClose);
      eventBus.off('feelPopup._open', handleOpen);
      eventBus.off('feelPopup._isOpen', handleIsOpen);
    };

  }, [ eventBus, isOpen ]);

  return (
    <FeelPopupContext.Provider value={ feelPopupContext }>
      { open && (
        <FeelPopupComponent
          onClose={ handleClose }
          container={ popupContainer }
          sourceElement={ sourceElement }
          emit={ emit }
          { ...popupConfig } />
      )}
      { props.children }
    </FeelPopupContext.Provider>
  );
}

function FeelPopupComponent(props) {
  const {
    container,
    id,
    hostLanguage,
    onInput,
    onClose,
    position,
    singleLine,
    sourceElement,
    title,
    tooltipContainer,
    type,
    value,
    variables,
    emit
  } = props;

  const editorRef = useRef();
  const popupRef = useRef();

  const isAutoCompletionOpen = useRef(false);

  const handleSetReturnFocus = () => {
    sourceElement && sourceElement.focus();
  };

  const onKeyDownCapture = (event) => {

    // we use capture here to make sure we handle the event before the editor does
    if (event.key === 'Escape') {
      isAutoCompletionOpen.current = autoCompletionOpen(event.target);
    }
  };

  const onKeyDown = (event) => {

    if (event.key === 'Escape') {

      // close popup only if auto completion is not open
      // we need to do check this because the editor is not
      // stop propagating the keydown event
      // cf. https://discuss.codemirror.net/t/how-can-i-replace-the-default-autocompletion-keymap-v6/3322/5
      if (!isAutoCompletionOpen.current) {
        onClose();
        isAutoCompletionOpen.current = false;
      }
    }
  };

  useEffect(() => {
    emit('opened', { domNode: popupRef.current });
    return () => emit('close', { domNode: popupRef.current });
  }, []);

  useEffect(() => {

    // Set focus on editor when popup is opened
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, [ editorRef ]);

  return (
    <Popup
      container={ container }
      className="bio-properties-panel-feel-popup"
      emit={ emit }
      position={ position }
      title={ title }
      onClose={ onClose }

      // handle focus manually on deactivate
      returnFocus={ false }
      closeOnEscape={ false }
      delayInitialFocus={ false }
      onPostDeactivate={ handleSetReturnFocus }
      height={ FEEL_POPUP_HEIGHT }
      width={ FEEL_POPUP_WIDTH }
      ref={ popupRef }
    >
      <Popup.Title
        title={ title }
        emit={ emit }
        draggable>
        {type === 'feel' && (
          <a href="https://docs.camunda.io/docs/components/modeler/feel/what-is-feel/" target="_blank" class="bio-properties-panel-feel-popup__title-link">
            Learn FEEL expressions
            <HelpIcon />
          </a>
        )
        }
        {type === 'feelers' && (
          <a href="https://docs.camunda.io/docs/components/modeler/forms/configuration/forms-config-templating-syntax/" target="_blank" class="bio-properties-panel-feel-popup__title-link">
            Learn templating
            <HelpIcon />
          </a>
        )
        }
      </Popup.Title>
      <Popup.Body>
        <div
          onKeyDownCapture={ onKeyDownCapture }
          onKeyDown={ onKeyDown }
          class="bio-properties-panel-feel-popup__body">

          {
            type === 'feel' && (
              <CodeEditor
                enableGutters={ true }
                id={ prefixId(id) }
                name={ id }
                onInput={ onInput }
                value={ value }
                variables={ variables }
                ref={ editorRef }
                tooltipContainer={ tooltipContainer }
              />
            )
          }

          {
            type === 'feelers' && (
              <TemplatingEditor
                id={ prefixId(id) }
                contentAttributes={ { 'aria-label': title } }
                enableGutters={ true }
                hostLanguage={ hostLanguage }
                name={ id }
                onInput={ onInput }
                value={ value }
                ref={ editorRef }
                singleLine={ singleLine }
                tooltipContainer={ tooltipContainer }
              />
            )
          }
        </div>
      </Popup.Body>
      <Popup.Footer>
        <button
          type="button"
          onClick={ () => onClose() }
          title="Close pop-up editor"
          class="bio-properties-panel-feel-popup__close-btn">Close</button>
      </Popup.Footer>
    </Popup>
  );
}

// helpers /////////////////

function prefixId(id) {
  return `bio-properties-panel-${id}`;
}

function autoCompletionOpen(element) {
  return element.closest('.cm-editor').querySelector('.cm-tooltip-autocomplete');
}

/**
 * This hook behaves like useEffect, but does not trigger on the first render.
 *
 * @param {Function} effect
 * @param {Array} deps
 */
function useUpdateEffect(effect, deps) {
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      return effect();
    } else {
      isMounted.current = true;
    }
  }, deps);
}