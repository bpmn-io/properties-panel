import Group from '../../../properties-panel/components/Group';

import {
  DocumentationProps,
  ErrorProps,
  ExecutableProperty,
  IdProperty,
  MessageProps,
  NameProperty,
  ProcessProps,
} from './properties';

import {
  isErrorSupported,
  isMessageSupported
} from './utils/EventDefinitionUtil';

function GeneralGroup(element) {

  const entries = [
    {
      id: 'name',
      component: <NameProperty element={ element } />
    },
    {
      id: 'id',
      component: <IdProperty element={ element } />
    },
    ...ProcessProps({ element }),
    {
      id: 'executable',
      component: <ExecutableProperty element={ element } />
    }
  ];

  return {
    id: 'general',
    label: 'General',
    entries,
    component: Group
  };

}

function DocumentationGroup(element) {

  const entries = [
    ...DocumentationProps({ element })
  ];

  return {
    id: 'documentation',
    label: 'Documentation',
    entries,
    component: Group
  };

}

function ErrorGroup(element) {

  const entries = [
    ...ErrorProps({ element })
  ];

  return {
    id: 'error',
    label: 'Error',
    entries,
    component: Group
  };

}

function MessageGroup(element) {

  const entries = [
    ...MessageProps({ element })
  ];

  return {
    id: 'message',
    label: 'Message',
    entries,
    component: Group
  };

}

function getGroups(element) {

  const groups = [
    GeneralGroup(element),
    DocumentationGroup(element)
  ];

  if (isErrorSupported(element)) {
    groups.push(ErrorGroup(element));
  }

  if (isMessageSupported(element)) {
    groups.push(MessageGroup(element));
  }

  return groups;
}

export default class BpmnPropertiesProvider {

  constructor(propertiesPanel) {
    propertiesPanel.registerProvider(this);
  }

  getGroups(element) {
    return (groups) => {
      groups = groups.concat(getGroups(element));
      return groups;
    };
  }

}

BpmnPropertiesProvider.$inject = [ 'propertiesPanel' ];