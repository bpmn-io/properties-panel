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
    label: 'ID',
    getValue,
    setValue,
    debounce
  });
}