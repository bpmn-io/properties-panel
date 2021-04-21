import {
  flatten
} from 'min-dash';

import ListGroup from '../../../properties-panel/components/ListGroup';

import {
  areInputParametersSupported,
  areOutputParametersSupported
} from './utils/InputOutputUtil';

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