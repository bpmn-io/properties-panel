import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/bpmn-properties-panel';

import BpmnPropertiesProvider from 'src/bpmn-properties-panel/provider/bpmn';

import ZeebePropertiesProvider from 'src/bpmn-properties-panel/provider/zeebe';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import {
  getInputParameters,
  getOutputParameters
} from 'src/bpmn-properties-panel/provider/zeebe/utils/InputOutputUtil';

import diagramXML from './InputOutputParameter.bpmn';


describe('provider/bpmn - InputOutputParameter', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    ZeebePropertiesProvider
  ];

  const moddleExtensions = {
    zeebe: zeebeModdleExtensions
  };

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    modules: testModules,
    moddleExtensions,
    debounceInput: false
  }));


  describe('bpmn:ServiceTask#input.target', function() {

    it('should NOT display for empty ioMapping',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const inputGroup = getGroup(container, 'inputs');
        const targetInput = domQuery('input[name=input-0-target]', inputGroup);

        // then
        expect(targetInput).to.not.exist;
      })
    );

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const inputGroup = getGroup(container, 'inputs');
      const targetInput = domQuery('input[name=input-0-target]', inputGroup);

      // then
      expect(targetInput.value).to.eql(getInput(serviceTask, 0).get('target'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const inputGroup = getGroup(container, 'inputs');
      const targetInput = domQuery('input[name=input-0-target]', inputGroup);
      changeInput(targetInput, 'newValue');

      // then
      expect(getInput(serviceTask, 0).get('target')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getInput(serviceTask, 0).get('target');

        await act(() => {
          selection.select(serviceTask);
        });
        const targetInput = domQuery('input[name=input-0-target]', container);
        changeInput(targetInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(targetInput.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:ServiceTask#input.source', function() {

    it('should NOT display for empty ioMapping',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const inputGroup = getGroup(container, 'inputs');
        const sourceInput = domQuery('input[name=input-0-source]', inputGroup);

        // then
        expect(sourceInput).to.not.exist;
      })
    );

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const inputGroup = getGroup(container, 'inputs');
      const sourceInput = domQuery('input[name=input-0-source]', inputGroup);

      // then
      expect(sourceInput.value).to.eql(getInput(serviceTask, 0).get('source'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const inputGroup = getGroup(container, 'inputs');
      const sourceInput = domQuery('input[name=input-0-source]', inputGroup);
      changeInput(sourceInput, 'newValue');

      // then
      expect(getInput(serviceTask, 0).get('source')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getInput(serviceTask, 0).get('source');

        await act(() => {
          selection.select(serviceTask);
        });
        const sourceInput = domQuery('input[name=input-0-source]', container);
        changeInput(sourceInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(sourceInput.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:ServiceTask#output.target', function() {

    it('should NOT display for empty ioMapping',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const outputGroup = getGroup(container, 'outputs');
        const targetInput = domQuery('input[name=output-0-target]', outputGroup);

        // then
        expect(targetInput).to.not.exist;
      })
    );

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const outputGroup = getGroup(container, 'outputs');
      const targetInput = domQuery('input[name=output-0-target]', outputGroup);

      // then
      expect(targetInput.value).to.eql(getOutput(serviceTask, 0).get('target'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const outputGroup = getGroup(container, 'outputs');
      const targetInput = domQuery('input[name=output-0-target]', outputGroup);
      changeInput(targetInput, 'newValue');

      // then
      expect(getOutput(serviceTask, 0).get('target')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getOutput(serviceTask, 0).get('target');

        await act(() => {
          selection.select(serviceTask);
        });
        const targetInput = domQuery('input[name=output-0-target]', container);
        changeInput(targetInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(targetInput.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:ServiceTask#output.source', function() {

    it('should NOT display for empty ioMapping',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const outputGroup = getGroup(container, 'outputs');
        const sourceInput = domQuery('input[name=output-0-source]', outputGroup);

        // then
        expect(sourceInput).to.not.exist;
      })
    );

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const outputGroup = getGroup(container, 'outputs');
      const sourceInput = domQuery('input[name=output-0-source]', outputGroup);

      // then
      expect(sourceInput.value).to.eql(getOutput(serviceTask, 0).get('source'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const outputGroup = getGroup(container, 'outputs');
      const sourceInput = domQuery('input[name=output-0-source]', outputGroup);
      changeInput(sourceInput, 'newValue');

      // then
      expect(getOutput(serviceTask, 0).get('source')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getOutput(serviceTask, 0).get('source');

        await act(() => {
          selection.select(serviceTask);
        });
        const sourceInput = domQuery('input[name=output-0-source]', container);
        changeInput(sourceInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(sourceInput.value).to.eql(originalValue);
      })
    );

  });

});


// helper //////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getInput(element, idx) {
  return (getInputParameters(element) || [])[idx];
}

function getOutput(element, idx) {
  return (getOutputParameters(element) || [])[idx];
}

