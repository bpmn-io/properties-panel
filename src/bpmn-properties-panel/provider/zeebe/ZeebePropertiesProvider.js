import Group from '../../../properties-panel/components/Group';
import ListGroup from '../../../properties-panel/components/ListGroup';

import {
  TaskDefinitionProps,
  MultiInstanceProps,
  InputProperties,
  OutputProperties
} from './properties';

import {
  areInputParametersSupported,
  areOutputParametersSupported
} from './utils/InputOutputUtil';

const LOW_PRIORITY = 500;

function TaskDefinitionGroup(element) {

  const entries = [
    ...TaskDefinitionProps({ element })
  ];

  return {
    id: 'taskDefinition',
    label: 'Task Definition',
    entries,
    component: Group
  };
}

function MultiInstanceGroup(element) {

  const entries = [
    ...MultiInstanceProps({ element })
  ];

  return {
    id: 'multiInstance',
    label: 'Multi Instance',
    entries,
    component: Group
  };
}

function InputGroup(element) {

  return {
    id: 'inputs',
    label: 'Input',
    component: ListGroup,
    ...InputProperties(element)
  };
}

function OutputGroup(element) {
  return {
    id: 'outputs',
    label: 'Output',
    component: ListGroup,
    ...OutputProperties(element)
  };
}

function getGroups(element) {

  const groups = [];

  const taskDefinitionGroup = TaskDefinitionGroup(element);

  if (taskDefinitionGroup.entries.length) {
    groups.push(taskDefinitionGroup);
  }

  const multiInstanceGroup = MultiInstanceGroup(element);

  if (multiInstanceGroup.entries.length) {
    groups.push(multiInstanceGroup);
  }

  if (areInputParametersSupported(element)) {
    groups.push(InputGroup(element));
  }

  if (areOutputParametersSupported(element)) {
    groups.push(OutputGroup(element));
  }

  return groups;
}

export default class ZeebePropertiesProvider {

  constructor(propertiesPanel) {
    propertiesPanel.registerProvider(LOW_PRIORITY, this);
  }

  getGroups(element) {
    return (groups) => {
      groups = groups.concat(getGroups(element));
      return groups;
    };
  }

}

ZeebePropertiesProvider.$inject = [ 'propertiesPanel' ];