import TestContainer from 'mocha-test-container-support';

import {
  clearBpmnJS,
  setBpmnJS,
  insertCoreStyles,
  insertBpmnStyles
} from 'test/TestHelper';

import Modeler from 'bpmn-js/lib/Modeler';

import {
  query as domQuery
} from 'min-dom';

import BpmnPropertiesPanel from 'src/bpmn-properties-panel';

import ZeebePropertiesProvider from 'src/bpmn-properties-panel/provider/bpmn';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from 'test/fixtures/service-task.bpmn';

insertCoreStyles();
insertBpmnStyles();


describe('<ZeebePropertiesProvider>', function() {

  let propertiesContainer,
      modelerContainer,
      modeler;

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
        ZeebePropertiesProvider
      ],
      moddleExtensions: {
        zeebe: ZeebeModdle
      },
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


  it('should show input group', function() {

    // given
    createModeler(diagramXML).then(() => {
      const elementRegistry = modeler.get('elementRegistry');

      const selection = modeler.get('selection');

      const serviceTask = elementRegistry.get('ServiceTask_1');

      // when
      selection.select(serviceTask);

      const inputGroup = getGroup(propertiesContainer, 'input');

      // then
      expect(inputGroup).to.exist;
    });
  });


  it('should show output group', function() {

    // given
    createModeler(diagramXML).then(() => {
      const elementRegistry = modeler.get('elementRegistry');

      const selection = modeler.get('selection');

      const serviceTask = elementRegistry.get('ServiceTask_1');

      // when
      selection.select(serviceTask);

      const outputGroup = getGroup(propertiesContainer, 'output');

      // then
      expect(outputGroup).to.exist;
    });

  });

});


// helpers /////////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}