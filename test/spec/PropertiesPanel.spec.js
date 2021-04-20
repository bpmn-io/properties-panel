import TestContainer from 'mocha-test-container-support';

import {
  clearBpmnJS,
  setBpmnJS
} from 'test/TestHelper';

import Modeler from 'bpmn-js/lib/Modeler';

import BpmnPropertiesPanel from 'src/features/bpmn-properties-panel';

import BpmnPropertiesProvider from 'src/features/bpmn-properties-panel/provider/bpmn';
import ZeebePropertiesProvider from 'src/features/bpmn-properties-panel/provider/zeebe';


import simpleXml from 'test/fixtures/diagram.bpmn';

const singleStart = window.__env__ && window.__env__.SINGLE_START;


describe('<PropertiesPanel>', function() {

  let modelerContainer;

  let propertiesContainer;

  let modeler;

  beforeEach(function() {
    modelerContainer = document.createElement('div');
    modelerContainer.classList.add('modeler-container');

    propertiesContainer = document.createElement('div');
    propertiesContainer.classList.add('properties-container');

    const container = TestContainer.get(this);

    container.appendChild(modelerContainer);
    container.appendChild(propertiesContainer);
  });

  function createModeler(xml, options = {}) {

    clearBpmnJS();

    modeler = new Modeler({
      container: modelerContainer,
      keyboard: {
        bindTo: document
      },
      additionalModules: [
        BpmnPropertiesPanel,
        BpmnPropertiesProvider,
        ZeebePropertiesProvider
      ],
      propertiesPanel: {
        parent: propertiesContainer
      },
      ...options
    });

    setBpmnJS(modeler);

    return modeler.importXML(xml).then(function(result) {
      return { error: null, warnings: result.warnings, modeler: modeler };
    }).catch(function(err) {
      return { error: err, warnings: err.warnings, modeler: modeler };
    });
  }

  (singleStart ? it.only : it)('should import simple process', function() {
    return createModeler(simpleXml).then(function(result) {

      expect(result.error).not.to.exist;
    });
  });

});