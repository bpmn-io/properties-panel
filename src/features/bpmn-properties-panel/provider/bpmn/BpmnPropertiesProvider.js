import {
  NameProperty,
  IdProperty,
  ExecutableProperty
} from './properties';

import {
  flatten
} from 'min-dash';

import Group from '../../../properties-panel/components/Group';

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

function getGroups(element) {

  const groups = [
    GeneralGroup(element)
  ];

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