import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import TextField from '../../../../properties-panel/components/entries/TextField';

import {
  useService
} from '../../../hooks';


export default function InputOutputParameter(props) {

  const {
    element,
    parameter
  } = props;

  const entries = [{
    id: 'target',
    component: <TargetProperty element={ element } parameter={ parameter } />
  },{
    id: 'source',
    component: <SourceProperty element={ element } parameter={ parameter } />
  }];

  return entries;
}

function TargetProperty(props) {
  const {
    element,
    parameter
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element,
      businessObject: parameter,
      properties: {
        target: value
      }
    });
  };

  const getValue = (parameter) => {
    return parameter.target;
  };

  return TextField({
    element: parameter,
    id: 'target',
    label: translate((is(parameter, 'zeebe:Input') ? 'Local Variable Name' : 'Process Variable Name')),
    getValue,
    setValue,
    debounce
  });
}

function SourceProperty(props) {
  const {
    element,
    parameter
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('properties-panel.update-businessobject', {
      element,
      businessObject: parameter,
      properties: {
        source: value
      }
    });
  };

  const getValue = (parameter) => {
    return parameter.source;
  };

  return TextField({
    element: parameter,
    id: 'source',
    label: translate('Variable Assignment Value'),
    getValue,
    setValue,
    debounce
  });
}