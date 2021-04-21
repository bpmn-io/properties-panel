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
  getOutputParameters,
  getIoMapping,
  createIOMapping
} from '../utils/InputOutputUtil';

import {
  createElement,
  nextId
} from '../utils/ElementUtil';

import PlusIcon from '../../../../icons/Plus.svg';


export default function OutputsProperties(props) {
  const {
    element
  } = props;

  const outputParameters = getOutputParameters(element);

  return (
    <div class="bio-properties-panel-list">
      {
        outputParameters.map(output => <InputOutputParameter element={ element } parameter={ output } />)
      }
    </div>
  );
}

export function addOutputParameter(props) {

  const {
    selectedElement: element
  } = useContext(PropertiesPanelContext);

  const bpmnFactory = useService('bpmnFactory');

  const commandStack = useService('commandStack');

  const addElement = (event) => {

    event.stopPropagation();

    let commands = [];

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

      commands.push({
        cmd: 'properties-panel.update-businessobject',
        context: {
          element: element,
          businessObject: businessObject,
          properties: { extensionElements }
        }
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

      commands.push({
        cmd: 'properties-panel.update-businessobject-list',
        context: {
          element: element,
          currentObject: extensionElements,
          propertyName: 'values',
          objectsToAdd: [ ioMapping ]
        }
      });
    }

    // (3) create parameter
    const newParameter = createElement('zeebe:Output', {
      source: '= source',
      target: nextId('OutputVariable_')
    }, ioMapping, bpmnFactory);

    // (4) add parameter to list
    commands.push({
      cmd: 'properties-panel.update-businessobject-list',
      context: {
        element: element,
        currentObject: ioMapping,
        propertyName: 'outputParameters',
        objectsToAdd: [ newParameter ]
      }
    });

    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return (
    <PlusIcon width="16" height="16" class="bio-properties-panel-plus" onClick={ addElement } />
  );
}