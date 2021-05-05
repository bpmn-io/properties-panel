import {
  getLabel
} from 'bpmn-js/lib/features/label-editing/LabelUtil';

import {
  is,
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  isExpanded,
  isEventSubProcess,
  isInterrupting
} from 'bpmn-js/lib/util/DiUtil';

import iconsByType from './icons';

export function getConcreteType(element) {
  const {
    type: elementType
  } = element;

  let type = getRawType(elementType);

  // (1) event definition types
  const eventDefinition = getEventDefinition(element);

  if (eventDefinition) {
    type = `${getEventDefinitionPrefix(eventDefinition)}${type}`;

    // (1.1) interrupting / non interrupting
    if (
      (is(element, 'bpmn:StartEvent') && !isInterrupting(element)) ||
        (is(element, 'bpmn:BoundaryEvent') && !isCancelActivity(element))
    ) {
      type = `${type}NonInterrupting`;
    }

    return type;
  }

  // (2) sub process types
  if (is(element, 'bpmn:SubProcess')) {
    if (isEventSubProcess(element)) {
      type = `Event${type}`;
    } else {
      type = `${isExpanded(element) ? 'Expanded' : 'Collapsed'}${type}`;
    }
  }

  // (3) loop characteristics markers
  const loopCharacteristics = getLoopCharacteristics(element);

  if (loopCharacteristics) {
    type = `${type}${getLoopCharacteristicsSuffix(loopCharacteristics)}`;
  }

  return type;
}

export const PanelHeaderProvider = {

  getElementLabel: (element) => {
    return getLabel(element);
  },

  getElementIcon: (element) => {
    const concreteType = getConcreteType(element);

    return iconsByType[ concreteType ] || iconsByType[ 'default' ];
  },

  getTypeLabel: (element) => {
    const concreteType = getConcreteType(element);

    return concreteType
      .replace(/([A-Z])/g, ' $1')
      .replace(/(\bNon Interrupting|Loop|Parallel|Sequential)/g, '($1)')
      .toUpperCase();
  }
};


// helpers ///////////////////////

function isCancelActivity(element) {
  const businessObject = getBusinessObject(element);

  return businessObject && businessObject.cancelActivity !== false;
}

function getEventDefinition(element) {
  const businessObject = getBusinessObject(element),
        eventDefinitions = businessObject.eventDefinitions;

  return eventDefinitions && eventDefinitions[0];
}

function getLoopCharacteristics(element) {
  const businessObject = getBusinessObject(element);

  return businessObject && businessObject.loopCharacteristics;
}

function getRawType(type) {
  return type.split(':')[1];
}

function getEventDefinitionPrefix(eventDefinition) {
  const rawType = getRawType(eventDefinition.$type);

  return rawType.replace('EventDefinition', '');
}

function getLoopCharacteristicsSuffix(loopCharacteristics) {
  if (is(loopCharacteristics, 'bpmn:StandardLoopCharacteristics')) {
    return 'Loop';
  }

  // assume 'bpmn:MultiInstanceLoopCharacteristics'
  return loopCharacteristics.isSequential ? 'Sequential' : 'Parallel';
}