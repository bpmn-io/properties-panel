import { useState } from 'preact/hooks';

import { FeelPlayground } from '@bpmn-io/feel-playground';

import { Popup } from './Popup';

export const FEEL_PLAYGROUND_POPUP_WIDTH = 900;
export const FEEL_PLAYGROUND_POPUP_HEIGHT = 640;

export function FeelPlaygroundPopup(props) {
  const {
    context = '{}',
    dialect = 'expression',
    eventBus,
    evaluationUnavailable,
    feelLanguageContext,
    onClose,
    onContextChange,
    onEvaluate,
    onInput,
    position,
    sourceElement,
    title,
    value = '',
    variables
  } = props;

  const [ localContext, setLocalContext ] = useState(context);

  const handleContextChange = (newContext) => {
    setLocalContext(newContext);
    onContextChange?.(newContext);
  };

  return (
    <Popup
      className="bio-properties-panel-feel-popup bio-properties-panel-feel-playground-popup"
      position={ position }
      title={ title }
      onPostDeactivate={ () => sourceElement?.focus() }
      returnFocus={ false }
      height={ FEEL_PLAYGROUND_POPUP_HEIGHT }
      width={ FEEL_PLAYGROUND_POPUP_WIDTH }
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
        <FeelPlayground
          context={ localContext }
          dialect={ dialect }
          evaluationUnavailable={ evaluationUnavailable }
          expression={ value }
          onContextChange={ handleContextChange }
          onEvaluate={ onEvaluate }
          onExpressionChange={ onInput }
          variables={ variables }
          { ...feelLanguageContext }
        />
      </Popup.Body>
    </Popup>
  );
}