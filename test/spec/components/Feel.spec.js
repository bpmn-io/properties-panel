import { act } from 'preact/test-utils';

import { waitFor } from '@testing-library/dom';
import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  classes as domClasses,
  query as domQuery
} from 'min-dom';

import EventBus from 'diagram-js/lib/core/EventBus';

import {
  changeInput,
  expectNoViolations,
  insertCoreStyles
} from 'test/TestHelper';

import {
  DescriptionContext,
  ErrorsContext,
  EventContext,
  PropertiesPanelContext
} from 'src/context';

import FeelField, { FeelTextArea, isEdited } from 'src/components/entries/FEEL';

insertCoreStyles();

const noop = () => {};

describe('<FeelField>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  describe('FEEL disabled (TextInput)', function() {

    it('should render', function() {

      // given
      const result = createFeelField({ container });

      // then
      expect(domQuery('.bio-properties-panel-feel-entry', result.container)).to.exist;
    });


    it('should update', function() {

      // given
      const updateSpy = sinon.spy();

      const result = createFeelField({ container, setValue: updateSpy });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      changeInput(input, 'foo');

      // then
      expect(updateSpy).to.have.been.calledWith('foo');
    });


    describe('#isEdited', function() {

      it('should NOT be edited', function() {

        // given
        const result = createFeelField({ container });

        const input = domQuery('.bio-properties-panel-input', result.container);

        // when
        const edited = isEdited(input);

        // then
        expect(edited).to.be.false;
      });


      it('should be edited', function() {

        // given
        const result = createFeelField({ container, getValue: () => 'foo' });

        const input = domQuery('.bio-properties-panel-input', result.container);

        // when
        const edited = isEdited(input);

        // then
        expect(edited).to.be.true;
      });


      it('should be edited after update', function() {

        // given
        const result = createFeelField({ container });

        const input = domQuery('.bio-properties-panel-input', result.container);

        // assume
        expect(isEdited(input)).to.be.false;

        // when
        changeInput(input, 'foo');

        // then
        expect(isEdited(input)).to.be.true;
      });

    });


    it('should use unique input element on element change', function() {

      // given
      const result = createFeelField({ element: {}, container });

      const input = domQuery('.bio-properties-panel-input', container);

      // when
      createFeelField({ element: {}, container }, result.render);

      // then
      const newInput = domQuery('.bio-properties-panel-input', container);

      expect(newInput).to.not.eql(input);
    });


    describe('events', function() {

      it('should show entry', function() {

        // given
        const eventBus = new EventBus();

        const onShowSpy = sinon.spy();

        createFeelField({ id: 'foo', container, eventBus, onShow: onShowSpy });

        // when
        act(() => eventBus.fire('propertiesPanel.showEntry', { id: 'foo' }));

        // then
        expect(onShowSpy).to.have.been.called;
      });

    });


    describe('errors', function() {

      it('should get error', function() {

        // given
        const errors = {
          foo: 'bar'
        };

        const result = createFeelField({ container, errors, id: 'foo' });

        // then
        expect(domQuery('.bio-properties-panel-error', result.container)).to.exist;
      });

    });

    describe('validation', function() {

      it('should set valid', function() {

        // given
        const validate = (v) => {
          if (v === 'bar') {
            return 'error';
          }
        };

        const result = createFeelField({ container, validate });

        const entry = domQuery('.bio-properties-panel-entry', result.container);

        const input = domQuery('.bio-properties-panel-input', entry);

        // when
        changeInput(input, 'foo');

        // then
        expect(isValid(entry)).to.be.true;
      });


      it('should set invalid', function() {

        // given
        const validate = (v) => {
          if (v === 'bar') {
            return 'error';
          }
        };

        const result = createFeelField({ container, validate });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('.bio-properties-panel-input', entry);

        // when
        changeInput(input, 'bar');

        // then
        expect(isValid(entry)).to.be.false;
      });


      it('should keep showing invalid value', function() {

        // given
        const validate = (v) => {
          if (v === 'bar') {
            return 'error';
          }
        };

        const result = createFeelField({ container, validate });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('.bio-properties-panel-input', entry);

        // when
        changeInput(input, 'bar');

        // then
        expect(input.value).to.eql('bar');
      });


      it('should show error message', function() {

        // given
        const validate = (v) => {
          if (v === 'bar') {
            return 'error';
          }
        };

        const result = createFeelField({ container, validate });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('.bio-properties-panel-input', entry);

        // when
        changeInput(input, 'bar');

        const error = domQuery('.bio-properties-panel-error', entry);

        // then
        expect(error).to.exist;
        expect(error.innerText).to.eql('error');
      });

    });


    describe('disabled', function() {

      it('should render enabled per default', function() {

        // given
        const result = createFeelField({ container });

        // then
        const textInput = domQuery('.bio-properties-panel-feel-entry input', result.container);
        expect(textInput.disabled).to.be.false;
      });


      it('should render enabled if set', function() {

        // given
        const result = createFeelField({
          container,
          disabled: false
        });

        // then
        const textInput = domQuery('.bio-properties-panel-feel-entry input', result.container);
        expect(textInput.disabled).to.be.false;
      });


      it('should render disabled if set', function() {

        // given
        const result = createFeelField({
          container,
          disabled: true
        });

        // then
        const textInput = domQuery('.bio-properties-panel-feel-entry input', result.container);
        expect(textInput.disabled).to.be.true;
      });

    });


    describe('description', function() {

      it('should render without description per default', function() {

        // given
        const result = createFeelField({
          container,
          id: 'noDescriptionTextField'
        });

        // then
        const description = domQuery('[data-entry-id="noDescriptionTextField"] .bio-properties-panel-description',
          result.container);
        expect(description).not.to.exist;
      });


      it('should render with description if set per props', function() {

        // given
        const result = createFeelField({
          container,
          id: 'descriptionTextField',
          label: 'someLabel',
          description: 'my description'
        });

        // then
        const description = domQuery('[data-entry-id="descriptionTextField"] .bio-properties-panel-description',
          result.container);

        expect(description).to.exist;
        expect(description.innerText).to.equal('my description');
      });


      it('should render with description if set per context', function() {

        // given
        const descriptionConfig = { descriptionTextField: (element) => 'myContextDesc' };

        const result = createFeelField({
          container,
          id: 'descriptionTextField',
          label: 'someLabel',
          descriptionConfig,
          getDescriptionForId: (id, element) => descriptionConfig[id](element)
        });

        // then
        const description = domQuery('[data-entry-id="descriptionTextField"] .bio-properties-panel-description',
          result.container);

        expect(description).to.exist;
        expect(description.innerText).to.equal('myContextDesc');
      });


      it('should render description set per props over context', function() {

        // given
        const descriptionConfig = { descriptionTextField: (element) => 'myContextDesc' };

        const result = createFeelField({
          container,
          id: 'descriptionTextField',
          label: 'someLabel',
          description: 'myExplicitDescription',
          descriptionConfig,
          getDescriptionForId: (id, element) => descriptionConfig[id](element)
        });

        // then
        const description = domQuery('[data-entry-id="descriptionTextField"] .bio-properties-panel-description',
          result.container);

        expect(description).to.exist;
        expect(description.innerText).to.equal('myExplicitDescription');
      });

    });


    it('should render optional feel icon', function() {

      // given
      const field = createFeelField({
        container,
        id: 'feelField',
        feel: 'optional'
      });

      // then
      const icon = domQuery('[data-entry-id="feelField"] .bio-properties-panel-feel-icon',
        field.container);
      expect(icon).to.exist;
    });


    describe('toggle', function() {

      it('should toggle feel active', function() {

        // given
        const updateSpy = sinon.spy();

        const field = createFeelField({
          container,
          id: 'feelField',
          feel: 'optional',
          getValue: () => 'foo',
          setValue: updateSpy
        });

        const icon = domQuery('[data-entry-id="feelField"] .bio-properties-panel-feel-icon',
          field.container);

        // when
        icon.click();

        // then
        return waitFor(() => {
          expect(updateSpy).to.have.been.calledWith('=foo');
          expect(domQuery('.bio-properties-panel-feel-editor-container', field.container)).to.exist;
        });
      });


      it('should toggle on input', function() {
        const updateSpy = sinon.spy();

        const result = createFeelField({
          container,
          getValue: () => 'foo',
          setValue: updateSpy
        });

        const input = domQuery('.bio-properties-panel-input', result.container);

        // when
        changeInput(input, '=foo');

        // then
        expect(updateSpy).to.have.been.calledWith('=foo');
        expect(domQuery('.bio-properties-panel-feel-editor-container', container)).to.exist;

      });


      it('should toggle on paste with FEEL mime type', function() {

        // given
        const updateSpy = sinon.spy();

        const result = createFeelField({
          container,
          feel: 'optional',
          getValue: () => 'foo',
          setValue: updateSpy
        });

        const input = domQuery('.bio-properties-panel-input', result.container);

        const data = new DataTransfer();
        data.setData('application/FEEL', 'foo');

        const paste = new ClipboardEvent('paste', {
          bubbles: true,
          clipboardData: data
        });

        // when
        input.dispatchEvent(paste);

        // then
        return waitFor(() => {
          expect(updateSpy).to.have.been.calledWith('=foo');
        });
      });

    });

  });


  describe('FEEL disabled (TextArea)', function() {

    it('should render', function() {

      // given
      const result = createFeelTextArea({ container });

      // then
      expect(domQuery('.bio-properties-panel-feel-entry', result.container)).to.exist;
    });


    // https://github.com/bpmn-io/bpmn-js-properties-panel/issues/810
    it('should be flagged with data-gramm="false"', function() {

      // when
      createFeelTextArea({ container });

      const input = domQuery('.bio-properties-panel-input', container);

      // then
      expect(input.dataset.gramm).to.eql('false');
    });


    it('should update', function() {

      // given
      const updateSpy = sinon.spy();

      const result = createFeelTextArea({ container, setValue: updateSpy });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      changeInput(input, 'foo');

      // then
      expect(updateSpy).to.have.been.calledWith('foo');
    });


    describe('#isEdited', function() {

      it('should NOT be edited', function() {

        // given
        const result = createFeelTextArea({ container });

        const input = domQuery('.bio-properties-panel-input', result.container);

        // when
        const edited = isEdited(input);

        // then
        expect(edited).to.be.false;
      });


      it('should be edited', function() {

        // given
        const result = createFeelTextArea({ container, getValue: () => 'foo' });

        const input = domQuery('.bio-properties-panel-input', result.container);

        // when
        const edited = isEdited(input);

        // then
        expect(edited).to.be.true;
      });


      it('should be edited after update', function() {

        // given
        const result = createFeelTextArea({ container });

        const input = domQuery('.bio-properties-panel-input', result.container);

        // assume
        expect(isEdited(input)).to.be.false;

        // when
        changeInput(input, 'foo');

        // then
        expect(isEdited(input)).to.be.true;
      });

    });


    describe('events', function() {

      it('should show entry', function() {

        // given
        const eventBus = new EventBus();

        const onShowSpy = sinon.spy();

        createFeelTextArea({ id: 'foo', container, eventBus, onShow: onShowSpy });

        // when
        act(() => eventBus.fire('propertiesPanel.showEntry', { id: 'foo' }));

        // then
        expect(onShowSpy).to.have.been.called;
      });

    });


    describe('errors', function() {

      it('should get error', function() {

        // given
        const errors = {
          foo: 'bar'
        };

        const result = createFeelTextArea({ container, errors, id: 'foo' });

        // then
        expect(domQuery('.bio-properties-panel-error', result.container)).to.exist;
      });

    });


    describe('validation', function() {

      it('should set valid', function() {

        // given
        const validate = (v) => {
          if (v === 'bar') {
            return 'error';
          }
        };

        const result = createFeelTextArea({ container, validate });

        const entry = domQuery('.bio-properties-panel-entry', result.container);

        const input = domQuery('.bio-properties-panel-input', entry);

        // when
        changeInput(input, 'foo');

        // then
        expect(isValid(entry)).to.be.true;
      });


      it('should set invalid', function() {

        // given
        const validate = (v) => {
          if (v === 'bar') {
            return 'error';
          }
        };

        const result = createFeelTextArea({ container, validate });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('.bio-properties-panel-input', entry);

        // when
        changeInput(input, 'bar');

        // then
        expect(isValid(entry)).to.be.false;
      });


      it('should keep showing invalid value', function() {

        // given
        const validate = (v) => {
          if (v === 'bar') {
            return 'error';
          }
        };

        const result = createFeelTextArea({ container, validate });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('.bio-properties-panel-input', entry);

        // when
        changeInput(input, 'bar');

        // then
        expect(input.value).to.eql('bar');
      });


      it('should show error message', function() {

        // given
        const validate = (v) => {
          if (v === 'bar') {
            return 'error';
          }
        };

        const result = createFeelTextArea({ container, validate });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('.bio-properties-panel-input', entry);

        // when
        changeInput(input, 'bar');

        const error = domQuery('.bio-properties-panel-error', entry);

        // then
        expect(error).to.exist;
        expect(error.innerText).to.eql('error');
      });

    });


    describe('disabled', function() {

      it('should render enabled per default', function() {

        // given
        const result = createFeelTextArea({ container });

        // then
        const textInput = domQuery('.bio-properties-panel-feel-entry textarea', result.container);
        expect(textInput.disabled).to.be.false;
      });


      it('should render enabled if set', function() {

        // given
        const result = createFeelTextArea({
          container,
          disabled: false
        });

        // then
        const textInput = domQuery('.bio-properties-panel-feel-entry textarea', result.container);
        expect(textInput.disabled).to.be.false;
      });


      it('should render disabled if set', function() {

        // given
        const result = createFeelTextArea({
          container,
          disabled: true
        });

        // then
        const textInput = domQuery('.bio-properties-panel-feel-entry textarea', result.container);
        expect(textInput.disabled).to.be.true;
      });

    });


    describe('description', function() {

      it('should render without description per default', function() {

        // given
        const result = createFeelTextArea({
          container,
          id: 'noDescriptionTextField'
        });

        // then
        const description = domQuery('[data-entry-id="noDescriptionTextField"] .bio-properties-panel-description',
          result.container);
        expect(description).not.to.exist;
      });


      it('should render with description if set per props', function() {

        // given
        const result = createFeelTextArea({
          container,
          id: 'descriptionTextField',
          label: 'someLabel',
          description: 'my description'
        });

        // then
        const description = domQuery('[data-entry-id="descriptionTextField"] .bio-properties-panel-description',
          result.container);

        expect(description).to.exist;
        expect(description.innerText).to.equal('my description');
      });


      it('should render with description if set per context', function() {

        // given
        const descriptionConfig = { descriptionTextField: (element) => 'myContextDesc' };

        const result = createFeelTextArea({
          container,
          id: 'descriptionTextField',
          label: 'someLabel',
          descriptionConfig,
          getDescriptionForId: (id, element) => descriptionConfig[id](element)
        });

        // then
        const description = domQuery('[data-entry-id="descriptionTextField"] .bio-properties-panel-description',
          result.container);

        expect(description).to.exist;
        expect(description.innerText).to.equal('myContextDesc');
      });


      it('should render description set per props over context', function() {

        // given
        const descriptionConfig = { descriptionTextField: (element) => 'myContextDesc' };

        const result = createFeelTextArea({
          container,
          id: 'descriptionTextField',
          label: 'someLabel',
          description: 'myExplicitDescription',
          descriptionConfig,
          getDescriptionForId: (id, element) => descriptionConfig[id](element)
        });

        // then
        const description = domQuery('[data-entry-id="descriptionTextField"] .bio-properties-panel-description',
          result.container);

        expect(description).to.exist;
        expect(description.innerText).to.equal('myExplicitDescription');
      });

    });


    it('should render optional feel icon', function() {

      // given
      const field = createFeelTextArea({
        container,
        id: 'feelField',
        feel: 'optional'
      });

      // then
      const icon = domQuery('[data-entry-id="feelField"] .bio-properties-panel-feel-icon',
        field.container);
      expect(icon).to.exist;
    });


    describe('toggle', function() {

      it('should toggle feel active', function() {

        // given
        const updateSpy = sinon.spy();

        const field = createFeelTextArea({
          container,
          id: 'feelField',
          feel: 'optional',
          getValue: () => 'foo',
          setValue: updateSpy
        });

        const icon = domQuery('[data-entry-id="feelField"] .bio-properties-panel-feel-icon',
          field.container);

        // when
        icon.click();

        // then
        return waitFor(() => {
          expect(updateSpy).to.have.been.calledWith('=foo');
          expect(domQuery('.bio-properties-panel-feel-editor-container', field.container)).to.exist;
        });
      });


      it('should toggle on input', function() {
        const updateSpy = sinon.spy();

        const result = createFeelTextArea({
          container,
          getValue: () => 'foo',
          setValue: updateSpy
        });

        const input = domQuery('.bio-properties-panel-input', result.container);

        // when
        changeInput(input, '=foo');

        // then
        expect(updateSpy).to.have.been.calledWith('=foo');
        expect(domQuery('.bio-properties-panel-feel-editor-container', container)).to.exist;

      });


    });

  });


  describe('FEEL enabled', function() {

    it('should render', function() {

      // given
      const result = createFeelField({ container, feel: 'required' });

      // then
      expect(domQuery('.bio-properties-panel-feel-entry', result.container)).to.exist;
    });


    it('should update', function() {

      // given
      const updateSpy = sinon.spy();

      const result = createFeelField({ container, setValue: updateSpy, feel: 'required' });

      const input = domQuery('[role="textbox"]', result.container);

      // when
      input.textContent = 'foo';

      // then
      return waitFor(() => {
        expect(updateSpy).to.have.been.calledWith('=foo');
      });
    });


    it('should render with missing = sign', async function() {

      // given
      const result = createFeelField({ container, feel: 'required', getValue: () => 'foo' });

      const entry = domQuery('.bio-properties-panel-entry', result.container);
      const input = domQuery('[role="textbox"]', entry);

      // then
      expect(input.textContent).to.eql('foo');
    });


    it('should update with missing = sign', function() {

      // given
      const updateSpy = sinon.spy();

      const result = createFeelField({ container, setValue: updateSpy, getValue: () => 'foo', feel: 'required' });

      const input = domQuery('[role="textbox"]', result.container);

      // when
      input.textContent += 'o';

      // then
      return waitFor(() => {
        expect(updateSpy).to.have.been.calledWith('=fooo');
      });
    });


    it('should not submit empty feel expression', function() {
      const updateSpy = sinon.spy();

      const result = createFeelField({
        container,
        getValue: () => 'foo',
        setValue: updateSpy
      });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      changeInput(input, '=');

      // then
      expect(updateSpy).to.have.been.calledWith(undefined);
      expect(domQuery('.bio-properties-panel-feel-editor-container', container)).to.exist;
    });


    it('should copy with FEEL mime type', async function() {

      // given
      const result = createFeelField({ container, feel: 'required', getValue: () => 'foo' });

      const contentEditable = domQuery('[role="textbox"]', result.container);

      const copyEvent = new ClipboardEvent('copy', {
        dataType: 'text/plain',
        data: 'foo',
        bubbles: true,
        clipboardData: new DataTransfer()
      });

      // when
      contentEditable.dispatchEvent(copyEvent);

      // then
      expect(copyEvent.clipboardData.getData('application/FEEL')).to.exist;
    });


    it('should cut with FEEL mime type', async function() {

      // given
      const result = createFeelField({ container, feel: 'required', getValue: () => 'foo' });

      const contentEditable = domQuery('[role="textbox"]', result.container);

      const copyEvent = new ClipboardEvent('copy', {
        dataType: 'text/plain',
        data: 'foo',
        bubbles: true,
        clipboardData: new DataTransfer()
      });

      // when
      contentEditable.dispatchEvent(copyEvent);

      // then
      expect(copyEvent.clipboardData.getData('application/FEEL')).to.exist;
    });


    describe('#isEdited', function() {

      it('should NOT be edited', function() {

        // given
        const result = createFeelField({ container, feel: 'required' });

        const input = domQuery('.bio-properties-panel-input', result.container);

        // when
        const edited = isEdited(input);

        // then
        expect(edited).to.be.false;
      });


      it('should be edited', function() {

        // given
        const result = createFeelField({ container, getValue: () => 'foo', feel: 'required' });

        const input = domQuery('.bio-properties-panel-input', result.container);

        // when
        const edited = isEdited(input);

        // then
        expect(edited).to.be.true;
      });


      it('should be edited after update', function() {

        // given
        const result = createFeelField({ container, feel: 'required' });

        const input = domQuery('.bio-properties-panel-input', result.container);
        const contentEditable = domQuery('[role="textbox"]', result.container);

        // assume
        expect(isEdited(input)).to.be.false;

        // when
        contentEditable.textContent = 'foo';

        // then
        return waitFor(() => {
          expect(isEdited(input)).to.be.true;
        });
      });

    });


    describe('events', function() {

      it('should show entry', function() {

        // given
        const eventBus = new EventBus();

        const onShowSpy = sinon.spy();


        createFeelField({ id: 'foo', container, eventBus, onShow: onShowSpy, feel: 'required' });

        // when
        act(() => eventBus.fire('propertiesPanel.showEntry', { id: 'foo' }));

        // then
        expect(onShowSpy).to.have.been.called;
      });

    });


    describe('errors', function() {

      it('should get error', function() {

        // given
        const errors = {
          foo: 'bar'
        };

        const result = createFeelField({ container, errors, id: 'foo', feel: 'required' });

        // then
        expect(domQuery('.bio-properties-panel-error', result.container)).to.exist;
      });


      it('should show syntax error', function() {

        // given
        const clock = sinon.useFakeTimers();
        const result = createFeelField({ container, getValue: () => '= foo == bar', feel: 'required' });

        // when
        // trigger debounced validation
        clock.tick(1000);
        clock.restore();

        // then
        return waitFor(() => {
          expect(domQuery('.bio-properties-panel-error', result.container)).to.exist;
        });
      });


      it('should show local error over global error', function() {

        // given
        const clock = sinon.useFakeTimers();
        const errors = {
          foo: 'bar'
        };

        const result = createFeelField({
          id: 'foo',
          container,
          errors,
          getValue: () => '= foo == bar',
          feel: 'required'
        });

        // assume
        let errorField = domQuery('.bio-properties-panel-error', result.container);
        expect(errorField).to.exist;
        expect(errorField.textContent).to.eql('bar');

        // when
        // trigger debounced validation
        clock.tick(1000);
        clock.restore();

        // then
        return waitFor(() => {
          errorField = domQuery('.bio-properties-panel-error', result.container);
          expect(errorField).to.exist;
          expect(errorField.textContent).not.to.eql('bar');
        });
      });

    });


    describe('validation', function() {

      it('should set valid', function() {

        // given
        const validate = (v) => {
          if (v === 'bar') {
            return 'error';
          }
        };

        const result = createFeelField({ container, validate, feel: 'required' });

        const entry = domQuery('.bio-properties-panel-entry', result.container);

        const input = domQuery('[role="textbox"]', entry);

        // when
        input.textContent = 'foo';

        // then
        return waitFor(() => {
          expect(isValid(entry)).to.be.true;
        });
      });


      it('should set invalid', function() {

        // given
        const validate = (v) => {
          if (v === '=bar') {
            return 'error';
          }
        };

        const result = createFeelField({ container, validate, feel: 'required' });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('[role="textbox"]', entry);

        // when
        input.textContent = 'bar';

        // then
        return waitFor(() => {
          expect(isValid(entry)).to.be.false;
        });
      });


      it('should keep showing invalid value', function() {

        // given
        const validate = (v) => {
          if (v === '=bar') {
            return 'error';
          }
        };

        const result = createFeelField({ container, validate, feel: 'required' });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('[role="textbox"]', entry);

        // when
        input.textContent = 'bar';

        // then
        return waitFor(() => {
          expect(input.textContent).to.eql('bar');
        });
      });


      it('should show error message', function() {

        // given
        const validate = (v) => {
          if (v === '=bar') {
            return 'error';
          }
        };

        const result = createFeelField({ container, validate, feel: 'required' });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('[role="textbox"]', entry);

        // when
        input.textContent = 'bar';

        // then
        return waitFor(() => {
          const error = domQuery('.bio-properties-panel-error', entry);
          expect(error).to.exist;
          expect(error.innerText).to.eql('error');
        });
      });

    });


    describe('disabled', function() {

      it('should render enabled per default', function() {

        // given
        const result = createFeelField({ container, feel: 'required' });

        // then
        const editorContainer = domQuery('.bio-properties-panel-feel-editor-container', result.container);
        expect(editorContainer.classList.contains('disabled')).to.be.false;
      });


      it('should render enabled if set', function() {

        // given
        const result = createFeelField({
          container,
          disabled: false,
          feel: 'required'
        });

        // then
        const editorContainer = domQuery('.bio-properties-panel-feel-editor-container', result.container);
        expect(editorContainer.classList.contains('disabled')).to.be.false;
      });


      it('should render disabled if set', function() {

        // given
        const result = createFeelField({
          container,
          disabled: true,
          feel: 'required'
        });

        // then
        const editorContainer = domQuery('.bio-properties-panel-feel-editor-container', result.container);
        expect(editorContainer.classList.contains('disabled')).to.be.true;
      });

    });


    describe('description', function() {

      it('should render without description per default', function() {

        // given
        const result = createFeelField({
          container,
          id: 'noDescriptionTextField',
          feel: 'required'
        });

        // then
        const description = domQuery('[data-entry-id="noDescriptionTextField"] .bio-properties-panel-description',
          result.container);
        expect(description).not.to.exist;
      });


      it('should render with description if set per props', function() {

        // given
        const result = createFeelField({
          container,
          id: 'descriptionTextField',
          label: 'someLabel',
          description: 'my description',
          feel: 'required'
        });

        // then
        const description = domQuery('[data-entry-id="descriptionTextField"] .bio-properties-panel-description',
          result.container);

        expect(description).to.exist;
        expect(description.innerText).to.equal('my description');
      });


      it('should render with description if set per context', function() {

        // given
        const descriptionConfig = { descriptionTextField: (element) => 'myContextDesc' };

        const result = createFeelField({
          container,
          id: 'descriptionTextField',
          label: 'someLabel',
          descriptionConfig,
          getDescriptionForId: (id, element) => descriptionConfig[id](element),
          feel: 'required'
        });

        // then
        const description = domQuery('[data-entry-id="descriptionTextField"] .bio-properties-panel-description',
          result.container);

        expect(description).to.exist;
        expect(description.innerText).to.equal('myContextDesc');
      });


      it('should render description set per props over context', function() {

        // given
        const descriptionConfig = { descriptionTextField: (element) => 'myContextDesc' };

        const result = createFeelField({
          container,
          id: 'descriptionTextField',
          label: 'someLabel',
          description: 'myExplicitDescription',
          descriptionConfig,
          getDescriptionForId: (id, element) => descriptionConfig[id](element),
          feel: 'required'
        });

        // then
        const description = domQuery('[data-entry-id="descriptionTextField"] .bio-properties-panel-description',
          result.container);

        expect(description).to.exist;
        expect(description.innerText).to.equal('myExplicitDescription');
      });

    });


    it('should render required feel icon', function() {

      // given
      const result = createFeelField({
        container,
        id: 'requiredFeelTextField',
        feel: 'required'
      });

      // then
      const icon = domQuery('[data-entry-id="requiredFeelTextField"] .bio-properties-panel-feel-icon',
        result.container);
      expect(icon).to.exist;
    });


    describe('toggle', function() {

      it('should toggle feel inactive', function() {

        // given
        const updateSpy = sinon.spy();

        const field = createFeelField({
          container,
          id: 'feelField',
          feel: 'optional',
          getValue: () => '=foo',
          setValue: updateSpy
        });

        const icon = domQuery('[data-entry-id="feelField"] .bio-properties-panel-feel-icon',
          field.container);

        // when
        icon.click();

        // then
        expect(updateSpy).to.have.been.calledWith('foo');
      });


      it('should NOT toggle if FEEL is required', function() {

        // given
        const updateSpy = sinon.spy();

        const field = createFeelField({
          container,
          id: 'feelField',
          feel: 'required',
          getValue: () => '=foo',
          setValue: updateSpy
        });

        const icon = domQuery('[data-entry-id="feelField"] .bio-properties-panel-feel-icon',
          field.container);

        // when
        icon.click();

        // then
        expect(updateSpy).not.to.have.been.called;

      });

    });

  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

      const { container: node } = createFeelField({
        container,
        label: 'foo'
      });

      // then
      await expectNoViolations(node);
    });

  });


  describe('variables', function() {

    it('should maintain focus when variables change', function() {

      // given
      const element = {};
      const props = {
        container,
        element,
        feel: 'required',
        getValue: () => '=foo',
        variables: [
          { name: 'foo', type: 'string' }
        ]
      };
      const field = createFeelField(props);

      const input = domQuery('[contenteditable]', field.container);
      input.focus();

      // when
      createFeelField({
        ...props,
        variables: [
          { name: 'bar', type: 'string' }
        ]
      }, field.render);

      // then
      expect(document.activeElement).to.equal(input);
    });
  });

});


// helpers ////////////////////

function createFeelField(options = {}, renderFn = render) {
  const {
    element,
    id,
    description,
    debounce = fn => fn,
    disabled,
    feel = 'optional',
    label,
    getValue = noop,
    setValue = noop,
    validate = noop,
    descriptionConfig = {},
    getDescriptionForId = noop,
    container,
    eventBus = new EventBus(),
    onShow = noop,
    errors = {},
    variables
  } = options;

  const errorsContext = {
    errors
  };

  const eventContext = {
    eventBus
  };

  const propertiesPanelContext = {
    onShow
  };

  const descriptionContext = {
    description: descriptionConfig,
    getDescriptionForId
  };

  return renderFn(
    <ErrorsContext.Provider value={ errorsContext }>
      <EventContext.Provider value={ eventContext }>
        <PropertiesPanelContext.Provider value={ propertiesPanelContext }>
          <DescriptionContext.Provider value={ descriptionContext }>
            <FeelField
              element={ element }
              id={ id }
              label={ label }
              description={ description }
              disabled={ disabled }
              getValue={ getValue }
              setValue={ setValue }
              debounce={ debounce }
              validate={ validate }
              feel={ feel }
              variables={ variables }
            />
          </DescriptionContext.Provider>
        </PropertiesPanelContext.Provider>
      </EventContext.Provider>
    </ErrorsContext.Provider>,
    {
      container
    }
  );
}


function createFeelTextArea(options = {}, renderFn = render) {
  const {
    element,
    id,
    description,
    debounce = fn => fn,
    disabled,
    feel = 'optional',
    label,
    getValue = noop,
    setValue = noop,
    validate = noop,
    descriptionConfig = {},
    getDescriptionForId = noop,
    container,
    eventBus = new EventBus(),
    onShow = noop,
    errors = {}
  } = options;

  const errorsContext = {
    errors
  };

  const eventContext = {
    eventBus
  };

  const propertiesPanelContext = {
    onShow
  };

  const descriptionContext = {
    description: descriptionConfig,
    getDescriptionForId
  };

  return renderFn(
    <ErrorsContext.Provider value={ errorsContext }>
      <EventContext.Provider value={ eventContext }>
        <PropertiesPanelContext.Provider value={ propertiesPanelContext }>
          <DescriptionContext.Provider value={ descriptionContext }>
            <FeelTextArea
              element={ element }
              id={ id }
              label={ label }
              description={ description }
              disabled={ disabled }
              getValue={ getValue }
              setValue={ setValue }
              debounce={ debounce }
              validate={ validate }
              feel={ feel } />
          </DescriptionContext.Provider>
        </PropertiesPanelContext.Provider>
      </EventContext.Provider>
    </ErrorsContext.Provider>,
    {
      container
    }
  );
}

function isValid(node) {
  return !domClasses(node).has('has-error');
}
