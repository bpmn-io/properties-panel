import {
  NameProperty,
  IdProperty,
  ExecutableProperty
} from './properties';

import Group from '../../../properties-panel/components/Group';

function GeneralGroup(element) {

  const entries = [];

  entries.push(<NameProperty element={ element } />);

  entries.push(<IdProperty element={ element } />);

  entries.push(<ExecutableProperty element={ element } />);

  return (
    <Group label="General">
      {
        entries
      }
    </Group>
  );
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
      return groups;
    };
  }

}

BpmnPropertiesProvider.$inject = [ 'propertiesPanel' ];