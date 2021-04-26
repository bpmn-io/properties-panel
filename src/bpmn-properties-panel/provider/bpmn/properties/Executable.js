import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import Checkbox from '../../../../properties-panel/components/entries/Checkbox';

import {
  useService
} from '../../../hooks';


export default function ExecutableProperty(props) {
  const {
    element
  } = props;

  if (!is(element, 'bpmn:Process')) {
    return;
  }

  const modeling = useService('modeling');

  const setValue = (value) => {
    modeling.updateProperties(element, {
      isExecutable: value
    });
  };

  const getValue = (element) => {
    return element.businessObject.isExecutable;
  };

  return Checkbox({
    element,
    id: 'isExecutable',
    label: 'Executable',
    getValue,
    setValue
  });
}