import {
  act
} from '@testing-library/preact';

import TestContainer from 'mocha-test-container-support';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject
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

import diagramXML from './Id.bpmn';

describe('provider/bpmn - Id', function() {

  const testModules = [
    CoreModule,
    SelectionModule,
    ModelingModule,
    BpmnPropertiesPanel,
    BpmnPropertiesProvider
  ];

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    modules: testModules,
    debounceInput: false
  }));


  describe('bpmn:Task#id', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const idInput = domQuery('input[name=id]', container);

      // then
      expect(idInput.value).to.eql(getBusinessObject(task).get('id'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const idInput = domQuery('input[name=id]', container);
      changeInput(idInput, 'NewID');

      // then
      expect(getBusinessObject(task).get('id')).to.eql('NewID');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const task = elementRegistry.get('Task_1');
        const originalValue = getBusinessObject(task).get('id');

        await act(() => {
          selection.select(task);
        });
        const idInput = domQuery('input[name=id]', container);
        changeInput(idInput, 'NewID');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(idInput.value).to.eql(originalValue);
      })
    );

  });

});