import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import TextField from '../../../../properties-panel/components/entries/TextField';

import {
  useService
} from '../../../hooks';


export default function IdProperty(props) {
  const {
    element
  } = props;

  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const translate = useService('translate');

  const setValue = (value) => {
    modeling.updateProperties(element, {
      id: value
    });
  };

  const getValue = (element) => {
    return element.businessObject.id;
  };

  return TextField({
    element,
    id: 'id',
    label: translate(is(element, 'bpmn:Participant') ? 'Participant ID' : 'ID'),
    getValue,
    setValue,
    debounce
  });
}