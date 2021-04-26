import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import ServiceTaskIcon from '../icons/ServiceTask.svg';
import StartEventIcon from '../icons/StartEvent.svg';
import DefaultElementIcon from '../icons/DefaultElement.svg';

// todo(pinussilvestrus): collect somewhere else + complete
const ELEMENT_ICON_MAP = {
  'bpmn:ServiceTask': ServiceTaskIcon,
  'bpmn:StartEvent': StartEventIcon,
  'default': DefaultElementIcon
};

export default class PanelHeaderProvider {

  // todo(pinussilvestrus): handle other cases as
  // a) Text Annotations
  // b) Groups
  static getElementLabel(element) {
    const businessObject = getBusinessObject(element);

    return businessObject.get('name');
  }

  static getElementIcon(element) {
    const {
      type
    } = element;

    return ELEMENT_ICON_MAP[ type ] || ELEMENT_ICON_MAP[ 'default' ];
  }

  static getTypeLabel(element) {
    const {
      type
    } = element;

    return type.split(':')[1]
      .replace(/([A-Z])/g, ' $1')
      .toUpperCase();
  }
}