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

import BpmnPropertiesProvider from 'src/bpmn-properties-panel/provider/bpmn';

import diagramXML from 'test/fixtures/simple.bpmn';

insertCoreStyles();
insertBpmnStyles();


describe('<BpmnPropertiesProvider>', function() {

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
        BpmnPropertiesProvider
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


  it('should show general group', function() {

    // when
    createModeler(diagramXML).then(() => {
      const generalGroup = getGroup(propertiesContainer, 'general');

      // then
      expect(generalGroup).to.exist;
    });

  });

});


// helpers /////////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}