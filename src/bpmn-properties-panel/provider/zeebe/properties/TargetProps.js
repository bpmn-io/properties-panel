import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  getExtensionElements
} from '../utils/ExtensionElementsUtil';

import {
  createElement
} from '../utils/ElementUtil';

import {
  useService
} from '../../../hooks';

import TextField from '../../../../properties-panel/components/entries/TextField';


export function TargetProps(props) {
  const {
    element
  } = props;

  if (!is(element, 'bpmn:CallActivity')) {
    return [];
  }

  return [ { id: 'targetProcessId', component: <TargetProcessId element={ element } /> } ];
}

function TargetProcessId(props) {
  const {
    element
  } = props;

  const commandStack = useService('commandStack'),
        bpmnFactory = useService('bpmnFactory'),
        translate = useService('translate'),
        debounce = useService('debounceInput');

  const getValue = () => {
    return getProcessId(element);
  };

  const setValue = (value) => {
    const commands = [];

    const businessObject = getBusinessObject(element);

    // (1) ensure extension elements
    let extensionElements = getExtensionElements(businessObject, 'zeebe:CalledElement');

    if (extensionElements.length === 0) {
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

    // (2) ensure zeebe:calledElement
    let calledElement = getCalledElement(businessObject);
    if (!calledElement) {
      calledElement = createElement(
        'zeebe:CalledElement',
        { },
        extensionElements,
        bpmnFactory);

      commands.push({
        cmd: 'properties-panel.update-businessobject-list',
        context: {
          element: element,
          currentObject: extensionElements,
          propertyName: 'values',
          objectsToAdd: [ calledElement ]
        }
      });

    }

    // (3) Update processId attribute
    commands.push({
      cmd: 'properties-panel.update-businessobject',
      context: {
        element: element,
        businessObject: calledElement,
        properties: {
          processId: value
        }
      }
    });

    // (4) Execute the commands
    commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  return TextField({
    element,
    id: 'targetProcessId',
    label: translate('Process ID'),
    getValue,
    setValue,
    debounce
  });
}


// helper ///////////////////

function getProcessId(element) {
  const calledElement = getCalledElement(element);

  return calledElement ? calledElement.get('processId') : '';
}

function getCalledElement(element) {
  const calledElements = getCalledElements(element);
  return calledElements[0];
}

function getCalledElements(element) {
  const bo = getBusinessObject(element);
  const extElements = getExtensionElements(bo, 'zeebe:CalledElement');
  return extElements;
}
