import { useEffect, useRef } from 'preact/hooks';
import { Popup } from './Popup';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

/**
 * @typedef {Object} TextPopupProps
 * @property {string} entryId
 * @property {Function} onInput
 * @property {Function} onClose
 * @property {string} title
 * @property {string} value
 * @property {Object} [position]
 * @property {HTMLElement} [sourceElement]
 * @property {Object} [eventBus]
 */

export const TEXT_POPUP_WIDTH = 700;
export const TEXT_POPUP_HEIGHT = 400;

/**
 * Plain text editor popup component.
 *
 * Intentionally kept separate from the FEEL popup: the two are expected to
 * diverge as we add FEEL-specific capabilities that do not apply to plain text.
 *
 * @param {TextPopupProps} props
 */
export function TextPopup(props) {
  const {
    entryId,
    onInput,
    onClose,
    title,
    value,
    position,
    sourceElement,
    eventBus
  } = props;

  const editorRef = useRef();
  const popupRef = useRef();

  const handleSetReturnFocus = () => {
    sourceElement && sourceElement.focus();
  };

  useEffect(() => {

    // set focus on editor when popup is opened
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, [ editorRef ]);

  return (
    <Popup
      className="bio-properties-panel-text-popup"
      position={ position }
      title={ title }
      returnFocus={ false }
      closeOnEscape={ true }
      delayInitialFocus={ false }
      onClose={ onClose }
      onPostDeactivate={ handleSetReturnFocus }
      height={ TEXT_POPUP_HEIGHT }
      width={ TEXT_POPUP_WIDTH }
      ref={ popupRef }
    >
      <Popup.Title
        title={ title }
        eventBus={ eventBus }
        showCloseButton={ true }
        closeButtonTooltip="Save and close"
        onClose={ onClose }
        draggable
      />
      <Popup.Body>
        <textarea
          id={ prefixId(entryId) }
          name={ entryId }
          class="bio-properties-panel-input"
          ref={ editorRef }
          onInput={ (e) => onInput(e.target.value) }
          value={ value || '' }
          spellCheck="false"
          autoComplete="off"
          aria-label={ title }
          data-gramm="false"
        />
      </Popup.Body>
    </Popup>
  );
}

function prefixId(id) {
  return `bio-properties-panel-${id}`;
}
