import TestContainer from 'mocha-test-container-support';

import {
  clearBpmnJS,
  setBpmnJS,
  insertCoreStyles,
  insertBpmnStyles
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import Modeler from 'bpmn-js/lib/Modeler';

import BpmnPropertiesPanel from 'src/bpmn-properties-panel';

import BpmnPropertiesProvider from 'src/bpmn-properties-panel/provider/bpmn';
import ZeebePropertiesProvider from 'src/bpmn-properties-panel/provider/zeebe';

import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';
import ZeebeModdleExtension from 'zeebe-bpmn-moddle/lib';

import ExamplePropertiesProvider from './extension/ExamplePropertiesProvider';

const singleStart = window.__env__ && window.__env__.SINGLE_START;

insertCoreStyles();
insertBpmnStyles();


describe('<BpmnPropertiesPanelRenderer>', function() {

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
        ZeebeModdleExtension,
        BpmnPropertiesPanel,
        BpmnPropertiesProvider,
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

  (singleStart ? it.only : it)('should import simple process', function() {
    const diagramXml = require('test/fixtures/simple.bpmn').default;

    return createModeler(diagramXml).then(function(result) {

      expect(result.error).not.to.exist;
    });
  });


  it('should allow providing custom entries', function() {

    // given
    const diagramXml = require('test/fixtures/service-task.bpmn').default;

    const modules = [
      ZeebeModdleExtension,
      BpmnPropertiesPanel,
      BpmnPropertiesProvider,
      ZeebePropertiesProvider,
      ExamplePropertiesProvider
    ];

    // when
    return createModeler(diagramXml, {
      additionalModules: modules
    }).then(function() {

      // then
      expect(getGroup(propertiesContainer, 'foo-group')).to.exist;
    });

  });

});


// helpers /////////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}