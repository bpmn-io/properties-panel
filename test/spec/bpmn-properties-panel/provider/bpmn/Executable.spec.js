import TestContainer from 'mocha-test-container-support';

import {
  bootstrapModeler,
  inject,
  insertCoreStyles,
  insertBpmnStyles,
  triggerEvent
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/bpmn-properties-panel';

import BpmnPropertiesProvider from 'src/bpmn-properties-panel/provider/bpmn';

import diagramXML from './Executable.bpmn';

insertCoreStyles();
insertBpmnStyles();


describe('provider/bpmn - Executable', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
    BpmnPropertiesProvider
  ];

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapModeler(diagramXML, {
    modules: testModules
  }));

  beforeEach(inject(function(commandStack, propertiesPanel) {

    const undoButton = document.createElement('button');
    undoButton.textContent = 'UNDO';

    undoButton.addEventListener('click', function() {
      commandStack.undo();
    });

    container.appendChild(undoButton);

    propertiesPanel.attachTo(container);
  }));


  it('should set', inject(function(elementRegistry, selection) {

    // given
    const shape = elementRegistry.get('Process_1');

    selection.select(shape);

    const isExecutableNode = domQuery('input[name=isExecutable]', container);

    // when
    triggerEvent(isExecutableNode, 'click');

    // then
    expect(getBusinessObject(shape).get('isExecutable')).to.equal(true);
  }));


  it('should undo', inject(function(elementRegistry, selection, commandStack) {

    // given
    const shape = elementRegistry.get('Process_1');

    selection.select(shape);

    const isExecutableNode = domQuery('input[name=isExecutable]', container);

    triggerEvent(isExecutableNode, 'click');

    // when
    commandStack.undo();

    // then
    expect(getBusinessObject(shape).get('isExecutable')).to.equal(false);
  }));


  it('should redo', inject(function(elementRegistry, selection, commandStack) {

    // given
    const shape = elementRegistry.get('Process_1');

    selection.select(shape);

    const isExecutableNode = domQuery('input[name=isExecutable]', container);

    triggerEvent(isExecutableNode, 'click');

    // when
    commandStack.undo();
    commandStack.redo();

    // then
    expect(getBusinessObject(shape).get('isExecutable')).to.equal(true);
  }));

});
