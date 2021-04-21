import {
  useContext
} from 'preact/hooks';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  PropertiesPanelContext
} from '../../../context';

import {
  useService
} from '../../../hooks';

import InputOutputParameter from './InputOutputParameter';

import {
  getInputParameters,
  getIoMapping,
  createIOMapping
} from '../utils/InputOutputUtil';

import {
  createElement,
  nextId
} from '../utils/ElementUtil';

import PlusIcon from '../../../../icons/Plus.svg';


export default function InputsProperties(props) {
  const {
    element
  } = props;

  const inputParameters = getInputParameters(element);

  return (
    <div class="bio-properties-panel-list">
      {
        inputParameters.map(input => <InputOutputParameter element={ element } parameter={ input } />)
      }
    </div>
  );
}

export function addInputParameter(props) {

  const {
    selectedElement: element
  } = useContext(PropertiesPanelContext);

  const bpmnFactory = useService('bpmnFactory');

  // todo: introduce multi command command?
  const commandStack = useService('commandStack');

  const addElement = (event) => {

    event.stopPropagation();

    const businessObject = getBusinessObject(element);

    let extensionElements = businessObject.get('extensionElements');

    // (1) ensure extension elements
    if (!extensionElements) {
      extensionElements = createElement(
        'bpmn:ExtensionElements',
        { values: [] },
        businessObject,
        bpmnFactory
      );

      commandStack.execute('properties-panel.update-businessobject', {
        element: element,
        businessObject: businessObject,
        properties: { extensionElements }
      });
    }

    // (2) ensure IoMapping
    let ioMapping = getIoMapping(element);

    if (!ioMapping) {
      const parent = extensionElements;

      ioMapping = createIOMapping({
        inputParameters: [],
        outputParameters: []
      }, parent, bpmnFactory);

      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: extensionElements,
        propertyName: 'values',
        objectsToAdd: [ ioMapping ]
      });
    }

    // (3) create parameter
    const newParameter = createElement('zeebe:Input', {
      source: '= source',
      target: nextId('InputVariable_')
    }, ioMapping, bpmnFactory);

    // (4) add parameter to list
    commandStack.execute('properties-panel.update-businessobject-list', {
      element: element,
      currentObject: ioMapping,
      propertyName: 'inputParameters',
      objectsToAdd: [ newParameter ]
    });

  };

  return (
    <PlusIcon width="16" height="16" class="bio-properties-panel-plus" onClick={ addElement } />
  );
}