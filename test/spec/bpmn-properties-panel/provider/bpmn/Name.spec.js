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

import diagramXML from './Name.bpmn';

describe('provider/bpmn - Name', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
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


  describe('bpmn:StartEvent#name', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const nameInput = domQuery('input[name=name]', container);

      // then
      expect(nameInput.value).to.eql(getBusinessObject(startEvent).get('name'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const startEvent = elementRegistry.get('StartEvent_1');

      await act(() => {
        selection.select(startEvent);
      });

      // when
      const nameInput = domQuery('input[name=name]', container);
      changeInput(nameInput, 'newValue');

      // then
      expect(getBusinessObject(startEvent).get('name')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const startEvent = elementRegistry.get('StartEvent_1');
        const originalValue = getBusinessObject(startEvent).get('name');

        await act(() => {
          selection.select(startEvent);
        });
        const nameInput = domQuery('input[name=name]', container);
        changeInput(nameInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(nameInput.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:Task#name', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const nameInput = domQuery('input[name=name]', container);

      // then
      expect(nameInput.value).to.eql(getBusinessObject(task).get('name'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const nameInput = domQuery('input[name=name]', container);
      changeInput(nameInput, 'newValue');

      // then
      expect(getBusinessObject(task).get('name')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const task = elementRegistry.get('Task_1');
        const originalValue = getBusinessObject(task).get('name');

        await act(() => {
          selection.select(task);
        });
        const nameInput = domQuery('input[name=name]', container);
        changeInput(nameInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(nameInput.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:TextAnnotation#text', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const textAnnotation = elementRegistry.get('TextAnnotation_1');

      await act(() => {
        selection.select(textAnnotation);
      });

      // when
      const nameInput = domQuery('input[name=name]', container);

      // then
      expect(nameInput.value).to.eql(getBusinessObject(textAnnotation).get('text'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const textAnnotation = elementRegistry.get('TextAnnotation_1');

      await act(() => {
        selection.select(textAnnotation);
      });

      // when
      const nameInput = domQuery('input[name=name]', container);
      changeInput(nameInput, 'newValue');

      // then
      expect(getBusinessObject(textAnnotation).get('text')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const textAnnotation = elementRegistry.get('TextAnnotation_1');
        const originalValue = getBusinessObject(textAnnotation).get('text');

        await act(() => {
          selection.select(textAnnotation);
        });
        const nameInput = domQuery('input[name=name]', container);
        changeInput(nameInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(nameInput.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:Group#categoryValueRef', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const group = elementRegistry.get('Group_1');

      await act(() => {
        selection.select(group);
      });

      // when
      const nameInput = domQuery('input[name=name]', container);

      // then
      expect(nameInput.value).to.eql(getCategoryValue(group).get('value'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const group = elementRegistry.get('Group_1');

      await act(() => {
        selection.select(group);
      });

      // when
      const nameInput = domQuery('input[name=name]', container);
      changeInput(nameInput, 'newValue');

      // then
      expect(getCategoryValue(group).get('value')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const group = elementRegistry.get('Group_1');
        const originalValue = getCategoryValue(group).get('value');

        await act(() => {
          selection.select(group);
        });
        const nameInput = domQuery('input[name=name]', container);
        changeInput(nameInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(nameInput.value).to.eql(originalValue);
      })
    );


    it('should create non existing category value',
      inject(async function(elementRegistry, selection) {

        // given
        const group = elementRegistry.get('Group_2');

        await act(() => {
          selection.select(group);
        });

        // assume
        expect(getCategoryValue(group)).not.to.exist;

        // when
        const nameInput = domQuery('input[name=name]', container);
        changeInput(nameInput, 'newValue');

        // then
        expect(getCategoryValue(group).get('value')).to.eql('newValue');
      })
    );

  });

});


// helper ////////////////////////////

function getCategoryValue(element) {
  return getBusinessObject(element).get('categoryValueRef');
}