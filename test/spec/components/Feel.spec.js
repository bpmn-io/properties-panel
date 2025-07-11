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
  clickInput,
  expectNoViolations,
  insertCoreStyles
} from 'test/TestHelper';

import {
  DescriptionContext,
  ErrorsContext,
  EventContext,
  FeelLanguageContext,
  PropertiesPanelContext
} from 'src/context';

import FeelField, {
  FeelCheckboxEntry,
  FeelNumberEntry,
  FeelTextAreaEntry,
  FeelToggleSwitchEntry,
  isEdited
} from 'src/components/entries/FEEL';

insertCoreStyles();

const noop = () => {};

describe('<FeelEntry>', function() {
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


    it('should render placeholder', function() {

      // given
      const result = createFeelField({ container, placeholder: 'foo' });

      // then
      const input = domQuery('[placeholder=foo]', result.container);
      expect(input).to.exist;
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


    it('should trim whitespace on blur', async function() {

      // given
      const setValueSpy = sinon.spy();
      const result = createFeelField({
        container,
        setValue: setValueSpy
      });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      input.focus();
      changeInput(input, '  foo  ');
      input.blur();

      // then
      expect(setValueSpy).to.have.been.calledTwice;
      expect(setValueSpy).to.have.been.calledWith('foo');
    });


    it('should call onBlur if provided', async function() {

      // given
      const onBlurSpy = sinon.spy();

      const result = createFeelField({
        container,
        onBlur: onBlurSpy
      });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      input.focus();
      input.blur();

      // then
      expect(onBlurSpy).to.have.been.calledOnce;
    });


    it('should not call setValue if the value is same', async function() {

      // given
      const setValueSpy = sinon.spy();

      const result = createFeelField({
        container,
        getValue: () => '',
        setValue: setValueSpy
      });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      input.focus();
      changeInput(input, '');
      input.blur();

      // then
      expect(setValueSpy).to.not.have.been.called;
    });


    describe('rerendering', function() {

      it('should call new setValue if passed', function() {

        // given
        const updateSpies = [ sinon.spy(), sinon.spy() ];

        const firstRender = createFeelField({ container, setValue: updateSpies[0] });

        // when
        createFeelField({ container, setValue: updateSpies[1] }, firstRender.rerender);
        const input = domQuery('.bio-properties-panel-input', firstRender.container);
        changeInput(input, 'foo');

        // then
        expect(updateSpies[0]).not.to.have.been.called;
        expect(updateSpies[1]).to.have.been.calledWith('foo');
      });


      it('should call new getValue if passed', function() {

        // given
        const element = undefined;
        const getValueSpies = [ sinon.spy(), sinon.spy() ];

        const firstRender = createFeelField({ container, getValue: getValueSpies[0] });

        // when
        createFeelField({ container, getValue: getValueSpies[1] }, firstRender.rerender);
        const input = domQuery('.bio-properties-panel-input', firstRender.container);
        getValueSpies[0].resetHistory();

        // and when
        changeInput(input, 'foo');

        // then
        expect(getValueSpies[0]).not.to.have.been.called;
        expect(getValueSpies[1]).to.have.been.calledWith(element);
      });


      it('should call new validate if passed', function() {

        // given
        const validateSpies = [ sinon.spy(), sinon.spy() ];

        const firstRender = createFeelField({ container, validate: validateSpies[0] });

        // when
        createFeelField({ container, validate: validateSpies[1] }, firstRender.rerender);
        const input = domQuery('.bio-properties-panel-input', firstRender.container);
        validateSpies[0].resetHistory();

        // and when
        changeInput(input, 'foo');

        // then
        expect(validateSpies[0]).not.to.have.been.called;
        expect(validateSpies[1]).to.have.been.calledWith('foo');
      });
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
        const validate = () => null;

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
        const validate = () => 'error';

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
        const validate = () => 'error';

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
        const validate = () => 'error';

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


      it('should pass error to `setValue`', function() {

        // given
        const setValueSpy = sinon.spy();
        const validate = () => 'error';

        const result = createFeelField({ container, validate, setValue: setValueSpy });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('.bio-properties-panel-input', entry);

        // when
        changeInput(input, 'bar');

        // then
        expect(setValueSpy).to.have.been.calledWith('bar', 'error');
      });


      it('should check again if validation function changes', function() {

        // given
        let validate = () => 'error';

        const result = createFeelField({ container, validate });
        const entry = domQuery('.bio-properties-panel-entry', result.container);

        // assume
        expect(isValid(entry)).to.be.false;

        // when
        validate = () => null;
        createFeelField({ container, validate }, result.render);

        // then
        expect(isValid(entry)).to.be.true;
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

      it('should toggle feel active', async function() {

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
        await act(() => {
          icon.click();
        });

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


  describe('FEEL disabled (NumberField)', function() {

    it('should render', function() {

      // given
      const result = createFeelNumber({ container });

      // then
      expect(domQuery('.bio-properties-panel-feel-entry', result.container)).to.exist;
    });


    it('should update', function() {

      // given
      const updateSpy = sinon.spy();

      const result = createFeelNumber({ container, setValue: updateSpy });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      changeInput(input, 2);

      // then
      expect(updateSpy).to.have.been.calledWith(2);
    });


    it('should update (floating point number)', function() {

      // given
      const updateSpy = sinon.spy();

      const result = createFeelNumber({ container, setValue: updateSpy, step: 'any' });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      changeInput(input, 20.5);

      // then
      expect(updateSpy).to.have.been.calledWith(20.5);
    });


    it('should update (0)', function() {

      // given
      const updateSpy = sinon.spy();

      const result = createFeelNumber({ container, setValue: updateSpy, step: 'any' });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      changeInput(input, 0);

      // then
      expect(updateSpy).to.have.been.calledWith(0);
    });


    describe('#isEdited', function() {

      it('should NOT be edited', function() {

        // given
        const result = createFeelNumber({ container });

        const input = domQuery('.bio-properties-panel-input', result.container);

        // when
        const edited = isEdited(input);

        // then
        expect(edited).to.be.false;
      });


      it('should be edited', function() {

        // given
        const result = createFeelNumber({ container, getValue: () => 2 });

        const input = domQuery('.bio-properties-panel-input', result.container);

        // when
        const edited = isEdited(input);

        // then
        expect(edited).to.be.true;
      });


      it('should be edited after update', function() {

        // given
        const result = createFeelNumber({ container });

        const input = domQuery('.bio-properties-panel-input', result.container);

        // assume
        expect(isEdited(input)).to.be.false;

        // when
        changeInput(input, 2);

        // then
        expect(isEdited(input)).to.be.true;
      });

    });


    it('should use unique input element on element change', function() {

      // given
      const result = createFeelNumber({ element: {}, container });

      const input = domQuery('.bio-properties-panel-input', container);

      // when
      createFeelNumber({ element: {}, container }, result.render);

      // then
      const newInput = domQuery('.bio-properties-panel-input', container);

      expect(newInput).to.not.eql(input);
    });


    describe('events', function() {

      it('should show entry', function() {

        // given
        const eventBus = new EventBus();

        const onShowSpy = sinon.spy();

        createFeelNumber({ id: 'foo', container, eventBus, onShow: onShowSpy });

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

        const result = createFeelNumber({ container, errors, id: 'foo' });

        // then
        expect(domQuery('.bio-properties-panel-error', result.container)).to.exist;
      });

    });

    describe('validation', function() {

      it('should set valid', function() {

        // given
        const validate = () => null;

        const result = createFeelNumber({ container, validate });

        const entry = domQuery('.bio-properties-panel-entry', result.container);

        const input = domQuery('.bio-properties-panel-input', entry);

        // when
        changeInput(input, 2);

        // then
        expect(isValid(entry)).to.be.true;
      });


      it('should set invalid', function() {

        // given
        const validate = () => 'error';

        const result = createFeelNumber({ container, validate });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('.bio-properties-panel-input', entry);

        // when
        changeInput(input, 3);

        // then
        expect(isValid(entry)).to.be.false;
      });


      it('should keep showing invalid value', function() {

        // given
        const validate = () => 'error';

        const result = createFeelNumber({ container, validate });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('.bio-properties-panel-input', entry);

        // when
        changeInput(input, 3);

        // then
        expect(input.value).to.eql('3');
      });


      it('should show error message', function() {

        // given
        const validate = () => 'error';

        const result = createFeelNumber({ container, validate });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('.bio-properties-panel-input', entry);

        // when
        changeInput(input, 3);

        const error = domQuery('.bio-properties-panel-error', entry);

        // then
        expect(error).to.exist;
        expect(error.innerText).to.eql('error');
      });


      it('should pass error to `setValue`', function() {

        // given
        const setValueSpy = sinon.spy();
        const validate = () => 'error';

        const result = createFeelNumber({ container, validate, setValue: setValueSpy });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('.bio-properties-panel-input', entry);

        // when
        changeInput(input, 3);

        // then
        expect(setValueSpy).to.have.been.calledWith(3, 'error');
      });
    });


    describe('disabled', function() {

      it('should render enabled per default', function() {

        // given
        const result = createFeelNumber({ container });

        // then
        const textInput = domQuery('.bio-properties-panel-feel-entry input', result.container);
        expect(textInput.disabled).to.be.false;
      });


      it('should render enabled if set', function() {

        // given
        const result = createFeelNumber({
          container,
          disabled: false
        });

        // then
        const textInput = domQuery('.bio-properties-panel-feel-entry input', result.container);
        expect(textInput.disabled).to.be.false;
      });


      it('should render disabled if set', function() {

        // given
        const result = createFeelNumber({
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
        const result = createFeelNumber({
          container,
          id: 'noDescriptionNumberField'
        });

        // then
        const description = domQuery('[data-entry-id="noDescriptionNumberField"] .bio-properties-panel-description',
          result.container);
        expect(description).not.to.exist;
      });


      it('should render with description if set per props', function() {

        // given
        const result = createFeelNumber({
          container,
          id: 'descriptionNumberField',
          label: 'someLabel',
          description: 'my description'
        });

        // then
        const description = domQuery('[data-entry-id="descriptionNumberField"] .bio-properties-panel-description',
          result.container);

        expect(description).to.exist;
        expect(description.innerText).to.equal('my description');
      });


      it('should render with description if set per context', function() {

        // given
        const descriptionConfig = { descriptionNumberField: (element) => 'myContextDesc' };

        const result = createFeelNumber({
          container,
          id: 'descriptionNumberField',
          label: 'someLabel',
          descriptionConfig,
          getDescriptionForId: (id, element) => descriptionConfig[id](element)
        });

        // then
        const description = domQuery('[data-entry-id="descriptionNumberField"] .bio-properties-panel-description',
          result.container);

        expect(description).to.exist;
        expect(description.innerText).to.equal('myContextDesc');
      });


      it('should render description set per props over context', function() {

        // given
        const descriptionConfig = { descriptionNumberField: (element) => 'myContextDesc' };

        const result = createFeelNumber({
          container,
          id: 'descriptionNumberField',
          label: 'someLabel',
          description: 'myExplicitDescription',
          descriptionConfig,
          getDescriptionForId: (id, element) => descriptionConfig[id](element)
        });

        // then
        const description = domQuery('[data-entry-id="descriptionNumberField"] .bio-properties-panel-description',
          result.container);

        expect(description).to.exist;
        expect(description.innerText).to.equal('myExplicitDescription');
      });

    });


    it('should render optional feel icon', function() {

      // given
      const field = createFeelNumber({
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

      it('should toggle feel active', async function() {

        // given
        const updateSpy = sinon.spy();

        const field = createFeelNumber({
          container,
          id: 'feelField',
          feel: 'optional',
          getValue: () => 2,
          setValue: updateSpy
        });

        const icon = domQuery('[data-entry-id="feelField"] .bio-properties-panel-feel-icon',
          field.container);

        // when
        await act(() => {
          icon.click();
        });

        // then
        return waitFor(() => {
          expect(updateSpy).to.have.been.calledWith('=2');
          expect(domQuery('.bio-properties-panel-feel-editor-container', field.container)).to.exist;
        });
      });


      it('should toggle on paste with FEEL mime type', function() {

        // given
        const updateSpy = sinon.spy();

        const result = createFeelField({
          container,
          feel: 'optional',
          getValue: () => 2,
          setValue: updateSpy
        });

        const input = domQuery('.bio-properties-panel-input', result.container);

        const data = new DataTransfer();
        data.setData('application/FEEL', 2);

        const paste = new ClipboardEvent('paste', {
          bubbles: true,
          clipboardData: data
        });

        // when
        input.dispatchEvent(paste);

        // then
        return waitFor(() => {
          expect(updateSpy).to.have.been.calledWith('=2');
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


    it('should render placeholder', function() {

      // given
      const result = createFeelTextArea({ container, placeholder: 'foo' });

      // then
      const input = domQuery('[placeholder=foo]', result.container);
      expect(input).to.exist;
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


    it('should trim whitespace on blur', async function() {

      // given
      const setValueSpy = sinon.spy();

      const result = createFeelTextArea({
        container,
        setValue: setValueSpy,
      });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      input.focus();
      changeInput(input, '  foo  ');
      input.blur();

      // then
      expect(setValueSpy).to.have.been.calledTwice;
      expect(setValueSpy).to.have.been.calledWith('foo');
    });


    it('should call onBlur if provided', async function() {

      // given
      const setValueSpy = sinon.spy();
      const onBlurSpy = sinon.spy();

      const result = createFeelTextArea({
        container,
        setValue: setValueSpy,
        onBlur: onBlurSpy
      });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      input.focus();
      changeInput(input, '  foo  ');
      input.blur();

      // then
      expect(onBlurSpy).to.have.been.calledOnce;
    });


    it('should not call setValue if the value is same', async function() {

      // given
      const setValueSpy = sinon.spy();

      const result = createFeelTextArea({
        container,
        getValue: () => '',
        setValue: setValueSpy
      });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      input.focus();
      changeInput(input, '');
      input.blur();

      // then
      expect(setValueSpy).to.not.have.been.called;

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
        const validate = () => null;

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
        const validate = () => 'error';

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
        const validate = () => 'error';

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
        const validate = () => 'error';

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


      it('should pass error to `setValue`', function() {

        // given
        const setValueSpy = sinon.spy();
        const validate = () => 'error';

        const result = createFeelTextArea({ container, validate, setValue: setValueSpy });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('.bio-properties-panel-input', entry);

        // when
        changeInput(input, 'bar');

        // then
        expect(setValueSpy).to.have.been.calledWith('bar', 'error');
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

      it('should toggle feel active', async function() {

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
        await act(() => {
          icon.click();
        });

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


  describe('FEEL disabled (Toggle Switch)', function() {

    it('should render', function() {

      // given
      const result = createFeelToggleSwitch({ container });

      // then
      expect(domQuery('.bio-properties-panel-feel-entry', result.container)).to.exist;
    });


    it('should update', function() {

      // given
      const updateSpy = sinon.spy();

      const result = createFeelToggleSwitch({ container, setValue: updateSpy, getValue: () => false });

      const slider = domQuery('.bio-properties-panel-toggle-switch__slider', result.container);

      // when
      clickInput(slider);

      // then
      expect(updateSpy).to.have.been.calledWith(true);
    });


    describe('#isEdited', function() {

      it('should NOT be edited', function() {

        // given
        const result = createFeelToggleSwitch({ container, getValue: () => false });

        const input = domQuery('.bio-properties-panel-input', result.container);

        // when
        const edited = isEdited(input);

        // then
        expect(edited).to.be.false;
      });


      it('should be edited', function() {

        // given
        const result = createFeelToggleSwitch({ container, getValue: () => true });

        const input = domQuery('.bio-properties-panel-input', result.container);

        // when
        const edited = isEdited(input);

        // then
        expect(edited).to.be.true;
      });


      it('should be edited after update', function() {

        // given
        const result = createFeelToggleSwitch({ container });

        const input = domQuery('.bio-properties-panel-input', result.container);

        // assume
        expect(isEdited(input)).to.be.false;

        // when
        const slider = domQuery('.bio-properties-panel-toggle-switch__slider', result.container);

        clickInput(slider);

        // then
        expect(isEdited(input)).to.be.true;
      });

    });


    it('should render optional feel icon', function() {

      // given
      const field = createFeelToggleSwitch({
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

      it('should toggle feel active', async function() {

        // given
        const updateSpy = sinon.spy();

        const field = createFeelToggleSwitch({
          container,
          id: 'feelField',
          feel: 'optional',
          getValue: () => true,
          setValue: updateSpy
        });

        const icon = domQuery('[data-entry-id="feelField"] .bio-properties-panel-feel-icon',
          field.container);

        // when
        await act(() => {
          icon.click();
        });

        // then
        return waitFor(() => {
          expect(updateSpy).to.have.been.calledWith('=true');
          expect(domQuery('.bio-properties-panel-feel-editor-container', field.container)).to.exist;
        });
      });

    });

  });


  describe('FEEL disabled (Checkbox)', function() {

    it('should render', function() {

      // given
      const result = createFeelCheckbox({ container });

      // then
      expect(domQuery('.bio-properties-panel-feel-entry', result.container)).to.exist;
    });


    it('should update', function() {

      // given
      const updateSpy = sinon.spy();

      const result = createFeelCheckbox({ container, setValue: updateSpy, getValue: () => false });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      clickInput(input);

      // then
      expect(updateSpy).to.have.been.calledOnceWith(true);
    });


    it('should update on blur', async function() {

      // given
      const updateSpy = sinon.spy();

      const result = createFeelCheckbox({ container, setValue: updateSpy, getValue: () => false });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      input.focus();
      clickInput(input);
      input.blur();

      // then
      expect(updateSpy).to.have.been.calledTwice;
      expect(updateSpy).to.have.always.been.calledWith(true);
    });

    describe('#isEdited', function() {

      it('should NOT be edited', function() {

        // given
        const result = createFeelCheckbox({ container, getValue: () => false });

        const input = domQuery('.bio-properties-panel-input', result.container);

        // when
        const edited = isEdited(input);

        // then
        expect(edited).to.be.false;
      });


      it('should be edited', function() {

        // given
        const result = createFeelCheckbox({ container, getValue: () => true });

        const input = domQuery('.bio-properties-panel-input', result.container);

        // when
        const edited = isEdited(input);

        // then
        expect(edited).to.be.true;
      });


      it('should be edited after update', function() {

        // given
        const result = createFeelCheckbox({ container });

        const input = domQuery('.bio-properties-panel-input', result.container);

        // assume
        expect(isEdited(input)).to.be.false;

        // when
        clickInput(input);

        // then
        expect(isEdited(input)).to.be.true;
      });

    });


    it('should render optional feel icon', function() {

      // given
      const field = createFeelCheckbox({
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

      it('should toggle feel active', async function() {

        // given
        const updateSpy = sinon.spy();

        const field = createFeelCheckbox({
          container,
          id: 'feelField',
          feel: 'optional',
          getValue: () => true,
          setValue: updateSpy
        });

        const icon = domQuery('[data-entry-id="feelField"] .bio-properties-panel-feel-icon',
          field.container);

        // when
        await act(() => {
          icon.click();
        });

        // then
        return waitFor(() => {
          expect(updateSpy).to.have.been.calledWith('=true');
          expect(domQuery('.bio-properties-panel-feel-editor-container', field.container)).to.exist;
        });
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


    it('should render placeholder', function() {

      // given
      const result = createFeelField({ container, placeholder: 'foo', feel: 'required' });

      // then
      const input = domQuery('[role="textbox"]', result.container);
      expect(input.textContent).to.eql('foo');
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


      it('should be edited after update', async function() {

        // given
        const result = createFeelField({ container, feel: 'required' });

        const input = domQuery('.bio-properties-panel-input', result.container);
        const contentEditable = domQuery('[role="textbox"]', result.container);

        // assume
        expect(isEdited(input)).to.be.false;

        // when
        await act(() => {
          contentEditable.textContent = 'foo';
        });

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


      it('should show syntax error', async function() {

        // given
        const clock = sinon.useFakeTimers();
        const result = createFeelField({ container, getValue: () => '= ...syntax error...', feel: 'required' });

        // when
        // trigger debounced validation
        await act(() => { clock.tick(1000); });
        await act(() => { clock.restore(); });

        // then
        await waitFor(() => {
          const errorField = domQuery('.bio-properties-panel-error', result.container);
          expect(errorField).to.exist;
          expect(errorField.textContent).to.eql('Unparsable FEEL expression.');
        });
      });


      it('should not indicate field error on non-syntax errors', async function() {

        // given
        const clock = sinon.useFakeTimers();
        const result = createFeelField({ container, getValue: () => '= friend[0]', feel: 'required' });

        // when
        // trigger debounced validation
        await act(() => { clock.tick(1000); });
        await act(() => { clock.restore(); });

        // then
        await waitFor(() => {
          const entry = domQuery('.bio-properties-panel-entry', result.container);

          expect(isValid(entry)).to.be.true;
        });
      });


      it('should show global error over local error', async function() {

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
        await act(() => { clock.tick(1000); });
        await act(() => { clock.restore(); });


        // then
        return waitFor(() => {
          errorField = domQuery('.bio-properties-panel-error', result.container);
          expect(errorField).to.exist;
          expect(errorField.textContent).to.eql('bar');
        });
      });

    });


    describe('validation', function() {

      it('should set valid', function() {

        // given
        const validate = () => null;

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


      it('should set invalid', async function() {

        // given
        const validate = () => 'error';

        const result = createFeelField({ container, validate, feel: 'required' });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('[role="textbox"]', entry);

        // when
        await act(() => {
          input.textContent = 'bar';
        });


        // then
        return waitFor(() => {
          expect(isValid(entry)).to.be.false;
        });
      });


      it('should keep showing invalid value', function() {

        // given
        const validate = () => 'error';

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


      it('should show error message', async function() {

        // given
        const validate = () => 'error';

        const result = createFeelField({ container, validate, feel: 'required' });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('[role="textbox"]', entry);

        // when
        await act(() => {
          input.textContent = 'bar';
        });


        // then
        return waitFor(() => {
          const error = domQuery('.bio-properties-panel-error', entry);
          expect(error).to.exist;
          expect(error.innerText).to.eql('error');
        });
      });


      it('should pass error to `setValue`', async function() {

        // given
        const setValueSpy = sinon.spy();
        const validate = () => 'error';

        const result = createFeelTextArea({ container, validate, setValue: setValueSpy, feel: 'required' });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('[role="textbox"]', entry);

        // when
        await act(() => {
          input.textContent = 'bar';
        });

        // then
        expect(setValueSpy).to.have.been.calledWith('=bar', 'error');
      });

    });

    describe('feel language contexte', function() {

      it('should fail linting backticks without camunda parser dialect',async function() {

        // given
        const validate = () => null;

        const result = createFeelField({ container, validate, feel: 'required' });

        const entry = domQuery('.bio-properties-panel-entry', result.container);

        const input = domQuery('[role="textbox"]', entry);

        // when
        input.textContent = '`backtick`';

        // then
        return waitFor(() => {
          expect(isValid(entry)).to.be.false;
        });
      });


      it('should pass linting backticks with camunda parser dialect',async function() {

        // given
        const validate = () => null;

        const result = createFeelField({ container, validate, feel: 'required', parserDialect: 'camunda' });

        const entry = domQuery('.bio-properties-panel-entry', result.container);

        const input = domQuery('[role="textbox"]', entry);

        // when
        input.textContent = '`backtick`';

        // then
        return waitFor(() => {
          expect(isValid(entry)).to.be.true;
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

      it('should toggle feel inactive', async function() {

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
        await act(() => {
          icon.click();
        });

        // then
        expect(updateSpy).to.have.been.calledWith('foo');
      });


      it('should NOT toggle if FEEL is required', async function() {

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
        await act(() => {
          icon.click();
        });

        // then
        expect(updateSpy).not.to.have.been.called;

      });

    });


    describe('opening popup', function() {

      it('should render open popup button', async function() {

        // given
        const result = createFeelField({
          container,
          feel: 'required',
          getValue: () => 'foo',
        });

        // then
        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const openPopupButton = domQuery(
          '.bio-properties-panel-open-feel-popup',
          entry
        );

        expect(openPopupButton).to.exist;
      });


      it('should fire <propertiesPanel.openPopup> event when clicking open popup button', async function() {

        // given
        const eventBus = new EventBus();
        const openPopupSpy = sinon.spy();
        eventBus.on('propertiesPanel.openPopup', openPopupSpy);

        const result = createFeelField({
          container,
          eventBus,
          feel: 'required',
          id: 'testField'
        });

        const openPopupButton = domQuery('.bio-properties-panel-open-feel-popup', result.container);

        // when
        await act(() => {
          clickInput(openPopupButton);
        });

        // then
        expect(openPopupSpy).to.have.been.calledOnce;
        expect(openPopupSpy.firstCall.args[0]).to.exist;
        expect(openPopupSpy.firstCall.args[0].entryId).to.equal('testField');
      });


      it('should fire <propertiesPanel.closePopup> event on component unmount', async function() {

        // given
        const eventBus = new EventBus();
        const closePopupSpy = sinon.spy();
        eventBus.on('propertiesPanel.closePopup', closePopupSpy);

        const result = createFeelField({
          container,
          eventBus,
          feel: 'required',
          id: 'testField'
        });

        // when
        await act(() => {
          result.unmount();
        });

        // then
        expect(closePopupSpy).to.have.been.calledOnce;
      });


      it('should show placeholder when popup open', async function() {

        // given
        const id = 'myField';
        const eventBus = new EventBus();
        eventBus.on('propertiesPanel.openPopup', () => true);

        const result = createFeelField({
          container,
          eventBus,
          feel: 'required',
          id
        });

        const openPopupButton = domQuery('.bio-properties-panel-open-feel-popup', result.container);

        // when
        await act(() => {
          clickInput(openPopupButton);
        });

        // then
        expect(domQuery('.bio-properties-panel-feel-editor__open-popup-placeholder', result.container)).to.exist;
      });


      it('should not show placeholder when popup closed', async function() {

        // given
        const id = 'myField';

        const result = createFeelField({
          container,
          feel: 'required',
          id
        });

        // then
        expect(domQuery('.bio-properties-panel-feel-editor__open-popup-placeholder', result.container)).not.to.exist;
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


    it('should have no violations - number', async function() {

      // given
      this.timeout(5000);

      const { container: node } = createFeelNumber({
        container,
        label: 'foo'
      });

      // then
      await expectNoViolations(node);
    });


    it('should have no violations - text area', async function() {

      // given
      this.timeout(5000);

      const { container: node } = createFeelTextArea({
        container,
        label: 'foo'
      });

      // then
      await expectNoViolations(node);
    });


    it('should have no violations - toggle switch', async function() {

      // given
      this.timeout(5000);

      const { container: node } = createFeelToggleSwitch({
        container,
        label: 'foo'
      });

      // then
      await expectNoViolations(node);
    });


    it('should have no violations - checkbox', async function() {

      // given
      this.timeout(5000);

      const { container: node } = createFeelCheckbox({
        container,
        label: 'foo'
      });

      // then
      await expectNoViolations(node);
    });


    it('should have no violations (feel)', async function() {

      // given
      this.timeout(5000);

      const { container: node } = createFeelField({
        container,
        label: 'foo',
        feel: 'required'
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
    id = 'feel',
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
    onBlur = noop,
    errors = {},
    variables,
    Component = FeelField,
    parserDialect,
    builtins,
    dialect,
    ...rest
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

  const feelLanguageContext = {
    parserDialect,
    builtins,
    dialect
  };

  return renderFn(
    <ErrorsContext.Provider value={ errorsContext }>
      <EventContext.Provider value={ eventContext }>
        <PropertiesPanelContext.Provider value={ propertiesPanelContext }>
          <DescriptionContext.Provider value={ descriptionContext }>
            <FeelLanguageContext.Provider value={ { feelLanguageContext } }>
              <Component
                element={ element }
                id={ id }
                label={ label }
                description={ description }
                disabled={ disabled }
                getValue={ getValue }
                setValue={ setValue }
                onBlur={ onBlur }
                debounce={ debounce }
                validate={ validate }
                feel={ feel }
                variables={ variables }
                { ...rest }
              />
            </FeelLanguageContext.Provider>
          </DescriptionContext.Provider>
        </PropertiesPanelContext.Provider>
      </EventContext.Provider>
    </ErrorsContext.Provider>,
    {
      container,
    }
  );
}

function createFeelNumber(options = {}, renderFn = render) {
  return createFeelField({
    ...options,
    Component: FeelNumberEntry
  }, renderFn);
}

function createFeelTextArea(options = {}, renderFn = render) {
  return createFeelField({
    ...options,
    Component: FeelTextAreaEntry
  }, renderFn);
}

function createFeelToggleSwitch(options = {}, renderFn = render) {
  return createFeelField({
    ...options,
    Component: FeelToggleSwitchEntry
  }, renderFn);
}

function createFeelCheckbox(options = {}, renderFn = render) {
  return createFeelField({
    ...options,
    Component: FeelCheckboxEntry
  }, renderFn);
}

function isValid(node) {
  return !domClasses(node).has('has-error');
}
