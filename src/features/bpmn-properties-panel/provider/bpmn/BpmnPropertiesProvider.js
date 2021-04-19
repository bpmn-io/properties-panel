import {
  NameProperty,
  IdProperty,
  ExecutableProperty
} from './properties';

import {
  flatten
} from 'min-dash';

import Group from '../../../properties-panel/components/Group';

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

function getGroups(element) {

  const groups = [
    GeneralGroup(element),

    // todo: remove me
    NOOP_GROUP,
    NOOP_GROUP,
    NOOP_GROUP,
    NOOP_GROUP
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