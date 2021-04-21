import {
  isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  getExtensionElements
} from './ExtensionElementsUtil';

function getElements(bo, type, prop) {
  const elems = getExtensionElements(bo, type);
  return !prop ? elems : (elems[0] || {})[prop] || [];
}

function getParameters(element, prop) {
  const inputOutput = getInputOutput(element);
  return (inputOutput && inputOutput.get(prop)) || [];
}

/**
 * Get a inputOutput from the business object
 *
 * @param {djs.model.Base} element
 *
 * @return {ModdleElement} the inputOutput object
 */
export function getInputOutput(element) {
  const bo = getBusinessObject(element);
  return (getElements(bo, 'zeebe:IoMapping') || [])[0];
}


/**
 * Return all input parameters existing in the business object, and
 * an empty array if none exist.
 *
 * @param  {djs.model.Base} element
 *
 * @return {Array} a list of input parameter objects
 */
export function getInputParameters(element) {
  return getParameters.apply(this, [ element, 'inputParameters' ]);
}

/**
 * Return all output parameters existing in the business object, and
 * an empty array if none exist.
 *
 * @param  {djs.model.Base} element
 *
 * @return {Array} a list of output parameter objects
 */
export function getOutputParameters(element) {
  return getParameters.apply(this, [ element, 'outputParameters' ]);
}

export function areInputParametersSupported(element) {
  return isAny(element, [
    'bpmn:ServiceTask',
    'bpmn:UserTask',
    'bpmn:SubProcess',
    'bpmn:CallActivity'
  ]);
}

export function areOutputParametersSupported(element) {
  return isAny(element, [
    'bpmn:ServiceTask',
    'bpmn:UserTask',
    'bpmn:SubProcess',
    'bpmn:ReceiveTask',
    'bpmn:CallActivity',
    'bpmn:Event'
  ]);
}