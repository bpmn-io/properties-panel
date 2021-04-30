import TextField from '../../../../properties-panel/components/entries/TextField';

import {
  useService
} from '../../../hooks';


export default function NameProperty(props) {
  const {
    element
  } = props;

  // todo(pinussilvestrus): handle other cases as
  // a) Text Annotations
  // b) Groups
  const modeling = useService('modeling');

  const setValue = (value) => {
    modeling.updateProperties(element, {
      name: value
    });
  };

  const getValue = (element) => {
    return element.businessObject.name;
  };

  return TextField({
    element,
    id: 'name',
    label: 'Name',
    getValue,
    setValue,
    debounce: true
  });
}