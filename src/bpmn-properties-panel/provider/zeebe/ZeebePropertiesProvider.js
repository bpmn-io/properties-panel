import {
  flatten
} from 'min-dash';

import ListGroup from '../../../properties-panel/components/ListGroup';

import {
  InputsProperties,
  OutputsProperties
} from './properties';

import {
  addInputParameter
} from './properties/Inputs';

import {
  addOutputParameter
} from './properties/Outputs';

import {
  areInputParametersSupported,
  areOutputParametersSupported
} from './utils/InputOutputUtil';

const LOW_PRIORITY = 500;


function InputsGroup(element) {
  const entries = [
    {
      id: 'inputs',
      component: <InputsProperties key="inputs" element={ element } />
    },
  ];

  return {
    id: 'inputs',
    label: 'Input',
    entries,
    add: addInputParameter,
    component: ListGroup
  };
}

function OutputsGroup(element) {
  const entries = [
    {
      id: 'inputs',
      component: <OutputsProperties key="outputs" element={ element } />
    },
  ];

  return {
    id: 'outputs',
    label: 'Output',
    entries,
    add: addOutputParameter,
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