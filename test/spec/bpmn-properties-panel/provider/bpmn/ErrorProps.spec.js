import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/bpmn-properties-panel';

import BpmnPropertiesProvider from 'src/bpmn-properties-panel/provider/bpmn';

import {
  getError
} from 'src/bpmn-properties-panel/provider/bpmn/utils/EventDefinitionUtil';

import diagramXML from './ErrorProps.bpmn';


describe('provider/bpmn - ErrorProps', function() {

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


  describe('bpmn:StartEvent#errorRef', function() {

    it('should NOT be displayed for normal start event',
      inject(async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('StartEvent_1');

        // when
        await act(() => {
          selection.select(startEvent);
        });

        // then
        const errorRefSelect = domQuery('select[name=errorRef]', container);

        expect(errorRefSelect).to.be.null;
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const errorEvent = elementRegistry.get('ErrorEvent_1');

      await act(() => {
        selection.select(errorEvent);
      });

      // when
      const errorRefSelect = domQuery('select[name=errorRef]', container);

      // then
      expect(errorRefSelect.value).to.eql(getError(errorEvent).get('id'));
    }));


    it('should display select options in correct order', inject(async function(elementRegistry, selection) {

      // given
      const errorEvent = elementRegistry.get('ErrorEvent_1');

      await act(() => {
        selection.select(errorEvent);
      });

      // when
      const errorRefSelect = domQuery('select[name=errorRef]', container);

      // then
      expect(asOptionNamesList(errorRefSelect)).to.eql([
        '<none>',
        'Create new ...',
        'Error_1',
        'Error_2',
        'Error_3'
      ]);
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const errorEvent = elementRegistry.get('ErrorEvent_1');

      await act(() => {
        selection.select(errorEvent);
      });

      // when
      const errorRefSelect = domQuery('select[name=errorRef]', container);
      changeInput(errorRefSelect, 'Error_2');

      // then
      expect(getError(errorEvent).get('id')).to.eql('Error_2');
    }));


    it('should create new error', inject(async function(elementRegistry, selection) {

      // given
      const errorEvent = elementRegistry.get('ErrorEvent_empty');

      await act(() => {
        selection.select(errorEvent);
      });

      // assume
      expect(getError(errorEvent)).to.not.exist;

      // when
      const errorRefSelect = domQuery('select[name=errorRef]', container);
      changeInput(errorRefSelect, 'create-new');

      // then
      expect(getError(errorEvent)).to.exist;
    }));


    it('should remove error reference', inject(async function(elementRegistry, selection) {

      // given
      const errorEvent = elementRegistry.get('ErrorEvent_1');

      await act(() => {
        selection.select(errorEvent);
      });

      // assume
      expect(getError(errorEvent)).to.exist;

      // when
      const errorRefSelect = domQuery('select[name=errorRef]', container);
      changeInput(errorRefSelect, '');

      // then
      expect(getError(errorEvent)).to.not.exist;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const errorEvent = elementRegistry.get('ErrorEvent_1');
        const originalValue = getError(errorEvent).get('id');

        await act(() => {
          selection.select(errorEvent);
        });
        const errorRefSelect = domQuery('select[name=errorRef]', container);
        changeInput(errorRefSelect, 'Error_2');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(errorRefSelect.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:StartEvent#errorRef.name', function() {

    it('should NOT be displayed for normal start event',
      inject(async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('StartEvent_1');

        // when
        await act(() => {
          selection.select(startEvent);
        });

        // then
        const errorNameInput = domQuery('input[name=errorName]', container);

        expect(errorNameInput).to.be.null;
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const errorEvent = elementRegistry.get('ErrorEvent_1');

      await act(() => {
        selection.select(errorEvent);
      });

      // when
      const errorNameInput = domQuery('input[name=errorName]', container);

      // then
      expect(errorNameInput.value).to.eql(getError(errorEvent).get('name'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const errorEvent = elementRegistry.get('ErrorEvent_1');

      await act(() => {
        selection.select(errorEvent);
      });

      // when
      const errorNameInput = domQuery('input[name=errorName]', container);
      changeInput(errorNameInput, 'newValue');

      // then
      expect(getError(errorEvent).get('name')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const errorEvent = elementRegistry.get('ErrorEvent_1');
        const originalValue = getError(errorEvent).get('name');

        await act(() => {
          selection.select(errorEvent);
        });
        const errorNameInput = domQuery('input[name=errorName]', container);
        changeInput(errorNameInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(errorNameInput.value).to.eql(originalValue);
      })
    );


    it('should not blow up on empty error name', inject(async function(elementRegistry, selection) {

      // given
      const errorEvent = elementRegistry.get('ErrorEvent_1');

      await act(() => {
        selection.select(errorEvent);
      });

      // when
      const errorNameInput = domQuery('input[name=errorName]', container);
      await act(() => {
        changeInput(errorNameInput, '');
      });

      // then
      expect(getError(errorEvent).get('name')).to.eql(undefined);
    }));

  });


  describe('bpmn:StartEvent#errorRef.code', function() {

    it('should NOT be displayed for normal start event',
      inject(async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('StartEvent_1');

        // when
        await act(() => {
          selection.select(startEvent);
        });

        // then
        const errorCodeInput = domQuery('input[name=errorCode]', container);

        expect(errorCodeInput).to.be.null;
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const errorEvent = elementRegistry.get('ErrorEvent_1');

      await act(() => {
        selection.select(errorEvent);
      });

      // when
      const errorCodeInput = domQuery('input[name=errorCode]', container);

      // then
      expect(errorCodeInput.value).to.eql(getError(errorEvent).get('errorCode'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const errorEvent = elementRegistry.get('ErrorEvent_1');

      await act(() => {
        selection.select(errorEvent);
      });

      // when
      const errorCodeInput = domQuery('input[name=errorCode]', container);
      changeInput(errorCodeInput, 'newValue');

      // then
      expect(getError(errorEvent).get('errorCode')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const errorEvent = elementRegistry.get('ErrorEvent_1');
        const originalValue = getError(errorEvent).get('errorCode');

        await act(() => {
          selection.select(errorEvent);
        });
        const errorCodeInput = domQuery('input[name=errorCode]', container);
        changeInput(errorCodeInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(errorCodeInput.value).to.eql(originalValue);
      })
    );

  });

});


// helper ///////////////

function asOptionNamesList(select) {
  const names = [];
  const options = domQueryAll('option', select);

  options.forEach(o => names.push(o.label));

  return names;
}