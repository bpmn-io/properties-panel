import {
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
    element
  } = props;

  const prevElement = usePrevious(element);

  const [ popupConfig, setPopupConfig ] = useState({});
  const [ open, setOpen ] = useState(false);
  const [ source, setSource ] = useState(null);
  const [ sourceElement, setSourceElement ] = useState(null);

  const handleOpen = (key, config, _sourceElement) => {
    setSource(key);
    setPopupConfig(config);
    setOpen(true);
    setSourceElement(_sourceElement);
  };

  const handleClose = () => {
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
    if (element && element !== prevElement) {
      handleClose();
    }
  }, [ element ]);

  return (
    <FeelPopupContext.Provider value={ feelPopupContext }>
      { open && (
        <FeelPopupComponent
          onClose={ handleClose }
          sourceElement={ sourceElement }
          { ...popupConfig } />
      )}
      { props.children }
    </FeelPopupContext.Provider>
  );
}

function FeelPopupComponent(props) {
  const {
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

  const handleSetReturnFocus = () => {
    sourceElement && sourceElement.focus();
  };

  useEffect(() => {
    const editor = editorRef.current;

    if (editor) {
      editor.focus();
    }
  }, [ editorRef, id ]);

  return (
    <Popup
      className="bio-properties-panel-feel-popup"
      position={ position }
      title={ title }
      onClose={ onClose }

      // handle focus manually on deactivate
      returnFocus={ false }
      onPostDeactivate={ handleSetReturnFocus }
      height={ FEEL_POPUP_HEIGHT }
      width={ FEEL_POPUP_WIDTH }
    >
      <Popup.Title
        title={ title }
        draggable />
      <Popup.Body>
        <div class="bio-properties-panel-feel-popup__body">

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