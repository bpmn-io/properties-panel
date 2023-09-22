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

export const FEEL_POPUP_WIDTH = 700;
export const FEEL_POPUP_HEIGHT = 250;


/**
 * FEEL popup component, built as a singleton.
 */
export default function FEELPopupRoot(props) {
  const {
    element,
    eventBus,
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

  const handleOpen = (entryId, config, _sourceElement) => {
    setSource(entryId);
    setPopupConfig(config);
    setOpen(true);
    setSourceElement(_sourceElement);
    emit('opened');
  };

  const handleClose = () => {
    setOpen(false);
    setSource(null);
    emit('closed');
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

    if (!eventBus) {
      return;
    }

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
      if (!eventBus) {
        return;
      }

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
    variables
  } = props;

  const editorRef = useRef();

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

  return (
    <Popup
      container={ container }
      className="bio-properties-panel-feel-popup"
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
    >
      <Popup.Title
        title={ title }
        draggable />
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
          onClick={ onClose }
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