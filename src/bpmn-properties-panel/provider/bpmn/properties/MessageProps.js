import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  sortBy
} from 'min-dash';

import TextField from '../../../../properties-panel/components/entries/TextField';
import Select from '../../../../properties-panel/components/entries/Select';

import {
  useService
} from '../../../hooks';

import {
  getMessage,
  getMessageEventDefinition
} from '../utils/EventDefinitionUtil';

import {
  createElement,
  findElementById,
  findRootElementsByType,
  getRoot,
  nextId
} from '../utils/ElementUtil';

const CREATE_NEW_OPTION = 'create-new';


export function MessageProps(props) {
  const {
    element
  } = props;

  const message = getMessage(element);

  let entries = [
    { id: 'messageRef', component: <MessageRef element={ element } /> }
  ];

  if (message) {
    entries = [
      ...entries,
      { id: 'messageName', component: <MessageName element={ element } /> },
    ];
  }

  return entries;
}

function MessageRef(props) {
  const { element } = props;

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const messageEventDefinition = getMessageEventDefinition(element);

  const getValue = () => {
    const message = getMessage(element);

    return message && message.get('id');
  };

  const setValue = (value) => {
    const root = getRoot(messageEventDefinition);
    const commands = [];

    let message;

    // (1) create new message
    if (value === CREATE_NEW_OPTION) {
      message = createElement(
        'bpmn:Message',
        { name: nextId('Message_') },
        root,
        bpmnFactory
      );

      value = message.get('id');

      commands.push({
        cmd: 'properties-panel.update-businessobject-list',
        context: {
          element,
          currentObject: root,
          propertyName: 'rootElements',
          objectsToAdd: [ message ]
        }
      });
    }

    // (2) update (or remove) messageRef
    message = message || findElementById(messageEventDefinition, 'bpmn:Message', value);

    commands.push({
      cmd: 'properties-panel.update-businessobject',
      context: {
        element,
        businessObject: messageEventDefinition,
        properties: {
          messageRef: message
        }
      }
    });

    // (3) commit all updates
    return commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  const getOptions = () => {

    let options = [
      { value: '', label: translate('<none>') },
      { value: CREATE_NEW_OPTION, label: translate('Create new') }
    ];

    const messages = findRootElementsByType(getBusinessObject(element), 'bpmn:Message');

    sortByName(messages).forEach(message => {
      options.push({
        value: message.get('id'),
        label: message.get('name')
      });
    });

    return options;
  };

  return Select({
    element,
    id: 'messageRef',
    label: translate('Global Message Reference'),
    getValue,
    setValue,
    getOptions
  });
}

function MessageName(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const message = getMessage(element);

  const getValue = () => {
    return message.get('name');
  };

  const setValue = (value) => {
    return commandStack.execute(
      'properties-panel.update-businessobject',
      {
        element,
        businessObject: message,
        properties: {
          name: value
        }
      }
    );
  };

  return TextField({
    element,
    id: 'messageName',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}


// helper /////////////////////////

function sortByName(elements) {
  return sortBy(elements, e => e.name.toLowerCase());
}