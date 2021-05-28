import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

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

import ZeebePropertiesProvider from 'src/bpmn-properties-panel/provider/zeebe';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import {
  getExtensionElements
} from 'src/bpmn-properties-panel/provider/zeebe/utils/ExtensionElementsUtil';

import diagramXML from './TaskDefinitionProps.bpmn';


describe('provider/zeebe - TaskDefinitionProps', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
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


  describe('bpmn:ServiceTask#taskDefinition.type', function() {

    it('should NOT display for receive task', inject(async function(elementRegistry, selection) {

      // given
      const receiveTask = elementRegistry.get('ReceiveTask_1');

      await act(() => {
        selection.select(receiveTask);
      });

      // when
      const typeInput = domQuery('input[name=taskDefinitionType]', container);

      // then
      expect(typeInput).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const typeInput = domQuery('input[name=taskDefinitionType]', container);

      // then
      expect(typeInput.value).to.eql(getTaskDefinition(serviceTask).get('type'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const typeInput = domQuery('input[name=taskDefinitionType]', container);
      changeInput(typeInput, 'newValue');

      // then
      expect(getTaskDefinition(serviceTask).get('type')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getTaskDefinition(serviceTask).get('type');

        await act(() => {
          selection.select(serviceTask);
        });
        const typeInput = domQuery('input[name=taskDefinitionType]', container);
        changeInput(typeInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(typeInput.value).to.eql(originalValue);
      })
    );


    it('should create non existing extension elements',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        // assume
        expect(getBusinessObject(serviceTask).get('extensionElements')).to.not.exist;

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const typeInput = domQuery('input[name=taskDefinitionType]', container);
        changeInput(typeInput, 'newValue');

        // then
        expect(getBusinessObject(serviceTask).get('extensionElements')).to.exist;
      })
    );


    it('should create non existing task definition',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_noTaskDefinition');

        // assume
        expect(getTaskDefinition(serviceTask)).not.to.exist;

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const typeInput = domQuery('input[name=taskDefinitionType]', container);
        changeInput(typeInput, 'newValue');

        // then
        expect(getTaskDefinition(serviceTask).get('type')).to.eql('newValue');
      })
    );

  });


  describe('bpmn:ServiceTask#taskDefinition.retries', function() {

    it('should NOT display for receive task', inject(async function(elementRegistry, selection) {

      // given
      const receiveTask = elementRegistry.get('ReceiveTask_1');

      await act(() => {
        selection.select(receiveTask);
      });

      // when
      const retriesInput = domQuery('input[name=taskDefinitionRetries]', container);

      // then
      expect(retriesInput).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const retriesInput = domQuery('input[name=taskDefinitionRetries]', container);

      // then
      expect(retriesInput.value).to.eql(getTaskDefinition(serviceTask).get('retries'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const retriesInput = domQuery('input[name=taskDefinitionRetries]', container);
      changeInput(retriesInput, 'newValue');

      // then
      expect(getTaskDefinition(serviceTask).get('retries')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getTaskDefinition(serviceTask).get('retries');

        await act(() => {
          selection.select(serviceTask);
        });
        const retriesInput = domQuery('input[name=taskDefinitionRetries]', container);
        changeInput(retriesInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(retriesInput.value).to.eql(originalValue);
      })
    );


    it('should create non existing extension elements',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        // assume
        expect(getBusinessObject(serviceTask).get('extensionElements')).to.not.exist;

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const retriesInput = domQuery('input[name=taskDefinitionRetries]', container);
        changeInput(retriesInput, 'newValue');

        // then
        expect(getBusinessObject(serviceTask).get('extensionElements')).to.exist;
      })
    );


    it('should create non existing task definition',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_noTaskDefinition');

        // assume
        expect(getTaskDefinition(serviceTask)).not.to.exist;

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const retriesInput = domQuery('input[name=taskDefinitionRetries]', container);
        changeInput(retriesInput, 'newValue');

        // then
        expect(getTaskDefinition(serviceTask).get('retries')).to.eql('newValue');
      })
    );

  });

});


// helper //////////////////

function getTaskDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElements(businessObject, 'zeebe:TaskDefinition')[0];
}
