import {
  flatten
} from 'min-dash';

import {
  isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import ListGroup from '../../../properties-panel/components/ListGroup';

const LOW_PRIORITY = 500;

function InputsGroup(element) {
  const entries = [];

  return {
    id: 'inputs',
    label: 'Input',
    entries,
    component: ListGroup
  };
}

function OutputsGroup(element) {
  const entries = [];

  return {
    id: 'outputs',
    label: 'Output',
    entries,
    component: ListGroup
  };
}

function getGroups(element) {

  const groups = [];

  if (areInputParametersSupported(element)) {
    groups.push(InputsGroup(element));
  }

  if (areOutputParametersSupported(element)) {
    groups.push(OutputsGroup(element));
  }

  return groups;
}

export default class ZeebePropertiesProvider {

  constructor(propertiesPanel) {
    propertiesPanel.registerProvider(LOW_PRIORITY, this);
  }

  getGroups(element) {
    return (groups) => {
      groups.push(getGroups(element));
      return flatten(groups);
    };
  }

}

ZeebePropertiesProvider.$inject = [ 'propertiesPanel' ];


// helper ////////////////////

// todo: move me to a helper
function areInputParametersSupported(element) {
  return isAny(element, [
    'bpmn:ServiceTask',
    'bpmn:UserTask',
    'bpmn:SubProcess',
    'bpmn:CallActivity'
  ]);
}

function areOutputParametersSupported(element) {
  return isAny(element, [
    'bpmn:ServiceTask',
    'bpmn:UserTask',
    'bpmn:SubProcess',
    'bpmn:ReceiveTask',
    'bpmn:CallActivity',
    'bpmn:Event'
  ]);
}