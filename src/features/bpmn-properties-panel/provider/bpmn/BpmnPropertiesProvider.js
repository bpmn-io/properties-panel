import {
  NameProperty,
  IdProperty,
  ExecutableProperty
} from './properties';

import {
  flatten
} from 'min-dash';

import {
  isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import Group from '../../../properties-panel/components/Group';
import ListGroup from '../../../properties-panel/components/ListGroup';

const NOOP_GROUP = {
  id: '__empty',
  label: 'Empty Group',
  entries: [],
  component: Group
};


function GeneralGroup(element) {

  const entries = [
    {
      id: 'name',
      component: <NameProperty key="name" element={ element } />
    },
    {
      id: 'id',
      component: <IdProperty key="id" element={ element } />
    },
    {
      id: 'executable',
      component: <ExecutableProperty key="executable" element={ element } />
    }
  ];

  return {
    id: 'group',
    label: 'General',
    entries,
    component: Group
  };

}

// todo: move me to Zeebe Properties Provider
function InputsGroup(element) {
  const entries = [];

  return {
    id: 'inputs',
    label: 'Input',
    entries,
    component: ListGroup
  };
}

// todo: move me to Zeebe Properties Provider
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

  const groups = [
    GeneralGroup(element)
  ];

  if (areInputParametersSupported(element)) {
    groups.push(InputsGroup(element));
  }

  if (areOutputParametersSupported(element)) {
    groups.push(OutputsGroup(element));
  }

  return groups;
}

export default class BpmnPropertiesProvider {

  constructor(propertiesPanel) {
    propertiesPanel.registerProvider(this);
  }

  getGroups(element) {
    return (groups) => {
      groups.push(getGroups(element));
      return flatten(groups);
    };
  }

}

BpmnPropertiesProvider.$inject = [ 'propertiesPanel' ];


// helper ////////////////////

// todo: move me to zeebe properties
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