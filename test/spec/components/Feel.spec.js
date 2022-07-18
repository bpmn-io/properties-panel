import { act } from 'preact/test-utils';

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
        icon.click();
        await flushPromises();

        // then
        expect(updateSpy).to.have.been.calledWith('=foo');
        expect(domQuery('.bio-properties-panel-feel-editor-container', field.container)).to.exist;

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


    });

  });


  describe('FEEL disabled (TextArea)', function() {

    it('should render', function() {

      // given
      const result = createFeelTextArea({ container });

      // then
      expect(domQuery('.bio-properties-panel-feel-entry', result.container)).to.exist;
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
        icon.click();
        await flushPromises();

        // then
        expect(updateSpy).to.have.been.calledWith('=foo');
        expect(domQuery('.bio-properties-panel-feel-editor-container', field.container)).to.exist;

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


    it('should update', async function() {

      // given
      const updateSpy = sinon.spy();

      const result = createFeelField({ container, setValue: updateSpy, feel: 'required' });

      const input = domQuery('[role="textbox"]', result.container);

      // when
      input.textContent = 'foo';
      await flushPromises();

      // then
      setTimeout(() => {
        expect(updateSpy).to.have.been.calledWith('=foo');
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
        contentEditable.textContent = 'foo';
        await flushPromises();

        // then
        expect(isEdited(input)).to.be.true;
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

    });



    describe('validation', function() {

      it('should set valid', async function() {

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
        await flushPromises();

        // then
        expect(isValid(entry)).to.be.true;
      });


      it('should set invalid', async function() {

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
        await flushPromises();

        // then
        expect(isValid(entry)).to.be.false;
      });


      it('should keep showing invalid value', async function() {

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
        await flushPromises();

        // then
        expect(input.textContent).to.eql('bar');
      });


      it('should show error message', async function() {

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
        await flushPromises();

        const error = domQuery('.bio-properties-panel-error', entry);

        // then
        expect(error).to.exist;
        expect(error.innerText).to.eql('error');
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

});


// helpers ////////////////////

function createFeelField(options = {}) {
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

  return render(
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


function createFeelTextArea(options = {}) {
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

  return render(
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

async function flushPromises() {
  await new Promise(resolve => setTimeout(resolve, 0));
}