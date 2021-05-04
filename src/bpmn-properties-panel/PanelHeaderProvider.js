import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import iconsByType from './icons';

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

    return iconsByType[ type ] || iconsByType[ 'default' ];
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