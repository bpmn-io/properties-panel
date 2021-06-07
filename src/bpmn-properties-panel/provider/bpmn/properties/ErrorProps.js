import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  sortBy
} from 'min-dash';

import TextField from '../../../../properties-panel/components/entries/TextField';
import ReferenceSelect from '../../../entries/ReferenceSelect';

import {
  useService
} from '../../../hooks';

import {
  getError,
  getErrorEventDefinition
} from '../utils/EventDefinitionUtil';

import {
  createElement,
  findElementById,
  findRootElementsByType,
  getRoot,
  nextId
} from '../utils/ElementUtil';

const CREATE_NEW_OPTION = 'create-new';


export function ErrorProps(props) {
  const {
    element
  } = props;

  const error = getError(element);

  let entries = [
    { id: 'errorRef', component: <ErrorRef element={ element } /> }
  ];

  if (error) {
    entries = [
      ...entries,
      { id: 'errorName', component: <ErrorName element={ element } /> },
      { id: 'errorCode', component: <ErrorCode element={ element } /> }
    ];
  }

  return entries;
}

function ErrorRef(props) {
  const { element } = props;

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  const errorEventDefinition = getErrorEventDefinition(element);

  const getValue = () => {
    const error = getError(element);

    return error && error.get('id');
  };

  const setValue = (value) => {
    const root = getRoot(errorEventDefinition);
    const commands = [];

    let error;

    // (1) create new error
    if (value === CREATE_NEW_OPTION) {
      error = createElement(
        'bpmn:Error',
        { name: nextId('Error_') },
        root,
        bpmnFactory
      );

      value = error.get('id');

      commands.push({
        cmd: 'properties-panel.update-businessobject-list',
        context: {
          element,
          currentObject: root,
          propertyName: 'rootElements',
          objectsToAdd: [ error ]
        }
      });
    }

    // (2) update (or remove) errorRef
    error = error || findElementById(errorEventDefinition, 'bpmn:Error', value);

    commands.push({
      cmd: 'properties-panel.update-businessobject',
      context: {
        element,
        businessObject: errorEventDefinition,
        properties: {
          errorRef: error
        }
      }
    });

    // (3) commit all updates
    return commandStack.execute('properties-panel.multi-command-executor', commands);
  };

  const getOptions = () => {

    let options = [
      { value: '', label: translate('<none>') },
      { value: CREATE_NEW_OPTION, label: translate('Create new ...') }
    ];

    const errors = findRootElementsByType(getBusinessObject(element), 'bpmn:Error');

    sortByName(errors).forEach(error => {
      options.push({
        value: error.get('id'),
        label: error.get('name')
      });
    });

    return options;
  };

  return ReferenceSelect({
    element,
    id: 'errorRef',
    label: translate('Global Error Reference'),
    autoFocusEntry: 'errorName',
    getValue,
    setValue,
    getOptions
  });
}

function ErrorName(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const error = getError(element);

  const getValue = () => {
    return error.get('name');
  };

  const setValue = (value) => {
    return commandStack.execute(
      'properties-panel.update-businessobject',
      {
        element,
        businessObject: error,
        properties: {
          name: value
        }
      }
    );
  };

  return TextField({
    element,
    id: 'errorName',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}

function ErrorCode(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const error = getError(element);

  const getValue = () => {
    return error.get('errorCode');
  };

  const setValue = (value) => {
    return commandStack.execute(
      'properties-panel.update-businessobject',
      {
        element,
        businessObject: error,
        properties: {
          errorCode: value
        }
      }
    );
  };

  return TextField({
    element,
    id: 'errorCode',
    label: translate('Code'),
    getValue,
    setValue,
    debounce
  });
}


// helper /////////////////////////

function sortByName(elements) {
  return sortBy(elements, e => e.name.toLowerCase());
}