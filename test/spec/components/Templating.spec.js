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
  expectNoViolations,
  insertCoreStyles
} from 'test/TestHelper';

import {
  DescriptionContext,
  ErrorsContext,
  EventContext,
  PropertiesPanelContext
} from 'src/context';

import TemplatingEntry, { isEdited } from 'src/components/entries/templating/Templating.js';

insertCoreStyles();

const noop = () => {};

describe('<Templating>', function() {

  let container;
  let clock;

  beforeEach(function() {
    container = TestContainer.get(this);
    clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    clock.restore();
  });

  describe('Templating Editor', function() {

    it('should render', function() {

      // given
      const result = createTemplatingEntry({ container });

      // then
      expect(domQuery('.bio-properties-panel-entry > .bio-properties-panel-feelers > .bio-properties-panel-feelers-input', result.container)).to.exist;
    });


    it('should update', async function() {

      // given
      const updateSpy = sinon.spy();

      const result = createTemplatingEntry({ container, setValue: updateSpy });

      const input = domQuery('[role="textbox"]', result.container);

      // when
      await act(() => input.textContent = 'Template {{x}}');

      // then
      return await waitFor(() => {
        expect(updateSpy).to.have.been.calledWith('Template {{x}}');
      });
    });


    it('should break line on very long text', async function() {

      // given
      const result = createTemplatingEntry({ container });

      const input = domQuery('[role="textbox"]', result.container);

      // when
      await act(() => input.textContent = 'Muda '.repeat(200));

      // then
      return waitFor(() => {
        expect(input.clientHeight).to.be.above(100);
      });
    });


    describe('#isEdited', function() {

      it('should NOT be edited', function() {

        // given
        const result = createTemplatingEntry({ container });

        const input = domQuery('.bio-properties-panel-input', result.container);

        // when
        const edited = isEdited(input);

        // then
        expect(edited).to.be.false;
      });


      it('should be edited', function() {

        // given
        const result = createTemplatingEntry({ container, getValue: () => 'foo' });

        const input = domQuery('.bio-properties-panel-input', result.container);

        // when
        const edited = isEdited(input);

        // then
        expect(edited).to.be.true;
      });


      it('should be edited after update', async function() {

        // given
        const result = createTemplatingEntry({ container });

        const input = domQuery('.bio-properties-panel-input', result.container);
        const contentEditable = domQuery('[role="textbox"]', result.container);

        // assume
        expect(isEdited(input)).to.be.false;

        // when
        await act(() => contentEditable.textContent = 'foo');

        // then
        await waitFor(() => {
          expect(isEdited(input)).to.be.true;
        });
      });

    });


    describe('events', function() {

      it('should show entry', function() {

        // given
        const eventBus = new EventBus();

        const onShowSpy = sinon.spy();


        createTemplatingEntry({ id: 'foo', container, eventBus, onShow: onShowSpy });

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

        const result = createTemplatingEntry({ container, errors, id: 'foo' });

        // then
        expect(domQuery('.bio-properties-panel-error', result.container)).to.exist;
      });


      it('should show syntax error (FEEL)', async function() {

        // given
        let result = createTemplatingEntry({ container, getValue: () => '= ...syntax error...' });

        // when
        await act(() => clock.tick(1000));
        await act(() => { clock.restore(); });

        // then
        await waitFor(() => {
          expect(domQuery('.bio-properties-panel-error', result.container)).to.exist;
        });

      });


      it('should show syntax error (feelers)', async function() {

        // given
        const result = createTemplatingEntry({ container, getValue: () => 'Template {{...syntax error...}}' });

        // when
        // trigger debounced validation
        await act(() => clock.tick(1000));
        await act(() => { clock.restore(); });

        // then
        await waitFor(() => {
          expect(domQuery('.bio-properties-panel-error', result.container)).to.exist;
        });

      });


      it('should not show syntax warnings', function() {

        // given
        const result = createTemplatingEntry({ container, getValue: () => 'Template {{}}' });

        // when
        // trigger debounced validation
        clock.tick(1000);

        // then
        return waitFor(() => {
          expect(domQuery('.bio-properties-panel-error', result.container)).to.not.exist;
        });

      });


      it('should show local error over global error', async function() {

        // given
        const errors = {
          foo: 'bar'
        };

        const result = createTemplatingEntry({
          id: 'foo',
          container,
          errors,
          getValue: () => '= ....syntax error....'
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
        await waitFor(() => {
          errorField = domQuery('.bio-properties-panel-error', result.container);
          expect(errorField).to.exist;
          expect(errorField.textContent).not.to.eql('bar');
        });
      });


      it('should not show local warning over global error', async function() {

        // given
        const errors = {
          foo: 'bar'
        };

        const result = createTemplatingEntry({
          id: 'foo',
          container,
          errors,
          getValue: () => '{{}}'
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
        await waitFor(() => {
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

        const result = createTemplatingEntry({ container, validate });

        const entry = domQuery('.bio-properties-panel-entry', result.container);

        const input = domQuery('[role="textbox"]', entry);

        // when
        input.textContent = '{{foo}}';

        // then
        return waitFor(() => {
          expect(isValid(entry)).to.be.true;
        });
      });


      it('should set invalid', async function() {

        // given
        const validate = () => 'error';

        const result = createTemplatingEntry({ container, validate });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('[role="textbox"]', entry);

        // when
        await act(() => input.textContent = '{{bar}}');

        // then
        return await waitFor(() => {
          expect(isValid(entry)).to.be.false;
        });
      });


      it('should keep showing invalid value', function() {

        // given
        const validate = () => 'error';

        const result = createTemplatingEntry({ container, validate });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('[role="textbox"]', entry);

        // when
        input.textContent = '{{bar}}';

        // then
        return waitFor(() => {
          expect(input.textContent).to.eql('{{bar}}');
        });
      });


      it('should show error message', async function() {

        // given
        const validate = () => 'error';

        const result = createTemplatingEntry({ container, validate });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('[role="textbox"]', entry);

        // when
        await act(() => input.textContent = 'bar');

        // then
        await waitFor(() => {
          const error = domQuery('.bio-properties-panel-error', entry);
          expect(error).to.exist;
          expect(error.innerText).to.eql('error');
        });
      });


      it('should NOT discard invalid input', async function() {

        // given
        const setValueSpy = sinon.spy();
        const validate = () => 'error';

        const result = createTemplatingEntry({ container, validate, setValue: setValueSpy });

        const entry = domQuery('.bio-properties-panel-entry', result.container);
        const input = domQuery('[role="textbox"]', entry);

        // when
        await act(() => input.textContent = '{{bar}}');

        // then
        return await waitFor(() => {
          expect(setValueSpy).to.have.been.calledWith('{{bar}}', 'error');
        });
      });


      it('should check again if validation function changes', function() {

        // given
        let validate = () => 'error';

        const result = createTemplatingEntry({ container, validate });
        const entry = domQuery('.bio-properties-panel-entry', result.container);

        // assume
        expect(isValid(entry)).to.be.false;

        // when
        validate = () => null;
        createTemplatingEntry({ container, validate }, result.render);

        // then
        expect(isValid(entry)).to.be.true;
      });

    });


    describe('disabled', function() {

      it('should render enabled per default', function() {

        // given
        const result = createTemplatingEntry({ container });

        // then
        const editorContainer = domQuery('.bio-properties-panel-feelers-editor', result.container);
        expect(editorContainer.classList.contains('disabled')).to.be.false;
      });


      it('should render enabled if set', function() {

        // given
        const result = createTemplatingEntry({
          container,
          disabled: false
        });

        // then
        const editorContainer = domQuery('.bio-properties-panel-feelers-editor', result.container);
        expect(editorContainer.classList.contains('disabled')).to.be.false;
      });


      it('should render disabled if set', function() {

        // given
        const result = createTemplatingEntry({
          container,
          disabled: true
        });

        // then
        const editorContainer = domQuery('.bio-properties-panel-feelers-editor', result.container);
        expect(editorContainer.classList.contains('disabled')).to.be.true;
      });

    });


    describe('description', function() {

      it('should render without description per default', function() {

        // given
        const result = createTemplatingEntry({
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
        const result = createTemplatingEntry({
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

        const result = createTemplatingEntry({
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

        const result = createTemplatingEntry({
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

  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

      const { container: node } = createTemplatingEntry({
        id: 'foo',
        container,
        label: 'foo'
      });

      await act(() => { clock.tick(1000); });
      await act(() => { clock.restore(); });

      // then
      await waitFor(async () => {
        await expectNoViolations(node);
      });

    });

  });

});


// helpers ////////////////////

function createTemplatingEntry(options = {}, renderFn = render) {
  const {
    element,
    id,
    description,
    debounce = fn => fn,
    disabled,
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
            <TemplatingEntry
              element={ element }
              id={ id }
              description={ description }
              debounce={ debounce }
              disabled={ disabled }
              label={ label }
              getValue={ getValue }
              setValue={ setValue }
              tooltipContainer={ container }
              validate={ validate }
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

function isValid(node) {
  return !domClasses(node).has('has-error');
}
