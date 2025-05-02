import { useEffect, useRef } from 'preact/hooks';
import FeelEditor from '../../../components/entries/FEEL/FeelEditor';
import TemplatingEditor from '../../../components/entries/templating/TemplatingEditor';
import { LaunchIcon } from '../../../components/icons';
import { Popup } from './Popup';

export function FeelPopup(props) {
  const {
    getLinks,
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
    eventBus,
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
      if (!isAutoCompletionOpen.current) {
        onClose();
        isAutoCompletionOpen.current = false;
      }
    }
  };

  useEffect(() => {

    // set focus on editor when popup is opened
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, [ editorRef ]);

  return (
    <Popup
      className="bio-properties-panel-feel-popup"
      position={ position }
      title={ title }
      onClose={ onClose }
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
        eventBus={ eventBus }
        eventNamespace="feelPopup"
        showCloseButton={ true }
        closeButtonTooltip="Save and close"
        onClose={ onClose }
        draggable
      >
        <>
          {getLinks(type).map((link, index) => {
            return (
              <a
                key={ index }
                rel="noreferrer"
                href={ link.href }
                target="_blank"
                class="bio-properties-panel-feel-popup__title-link"
              >
                {link.title}
                <LaunchIcon />
              </a>
            );
          })}
        </>
      </Popup.Title>
      <Popup.Body>
        <div
          onKeyDownCapture={ onKeyDownCapture }
          onKeyDown={ onKeyDown }
          class="bio-properties-panel-feel-popup__body"
        >
          {type === 'feel' && (
            <FeelEditor
              enableGutters={ true }
              id={ prefixId(id) }
              name={ id }
              onInput={ onInput }
              value={ value }
              variables={ variables }
              ref={ editorRef }
              tooltipContainer={ tooltipContainer }
            />
          )}

          {type === 'feelers' && (
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
          )}
        </div>
      </Popup.Body>
    </Popup>
  );
}

// constants
export const FEEL_POPUP_WIDTH = 700;
export const FEEL_POPUP_HEIGHT = 250;

// helpers
function prefixId(id) {
  return `bio-properties-panel-${id}`;
}

function autoCompletionOpen(element) {
  return element
    .closest('.cm-editor')
    .querySelector('.cm-tooltip-autocomplete');
}
