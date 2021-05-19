import { is } from 'bpmn-js/lib/util/ModelUtil';
import TextField from '../../../../properties-panel/components/entries/TextField';

import {
  useService
} from '../../../hooks';


export function ProcessProps(props) {
  const {
    element
  } = props;

  if (!hasProcessRef(element)) {
    return [];
  }

  return [
    { id: 'processId', component: <ProcessId element={ element } /> },
    { id: 'processName', component: <ProcessName element={ element } /> }
  ];
}

function ProcessName(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const process = element.businessObject.get('processRef');

  const getValue = () => {
    return process.get('name');
  };

  const setValue = (value) => {
    commandStack.execute(
      'properties-panel.update-businessobject',
      {
        element,
        businessObject: process,
        properties: {
          name: value
        }
      }
    );
  };

  return TextField({
    element,
    id: 'processName',
    label: translate('Process Name'),
    getValue,
    setValue,
    debounce
  });
}

function ProcessId(props) {
  const { element } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');
  const process = element.businessObject.get('processRef');

  const getValue = () => {
    return process.get('id');
  };

  const setValue = (value) => {
    commandStack.execute(
      'properties-panel.update-businessobject',
      {
        element,
        businessObject: process,
        properties: {
          id: value
        }
      }
    );
  };

  return TextField({
    element,
    id: 'processId',
    label: translate('Process ID'),
    getValue,
    setValue,
    debounce
  });
}

function hasProcessRef(element) {
  return is(element, 'bpmn:Participant') && element.businessObject.get('processRef');
}