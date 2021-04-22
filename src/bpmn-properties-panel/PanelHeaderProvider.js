import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

// todo: collect somewhere else + complete
const ELEMENT_ICON_MAP = {
  'bpmn:ServiceTask': require('../icons/ServiceTask.svg').default,
  'bpmn:StartEvent': require('../icons/StartEvent.svg').default,
  'default': require('../icons/DefaultElement.svg').default
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

    return ELEMENT_ICON_MAP[type] || ELEMENT_ICON_MAP['default'];
  }
}