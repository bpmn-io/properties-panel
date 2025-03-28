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

import debounceInput from '../../../src/features/debounce-input/debounceInput';

import TextField, { isEdited } from 'src/components/entries/TextField';

insertCoreStyles();

const noop = () => {};


describe('<TextField>', function() {

  let clock;

  let container;

  let debounce;

  beforeEach(function() {
    container = TestContainer.get(this);
    clock = sinon.useFakeTimers();
    debounce = debounceInput();
  });

  afterEach(function() {
    clock && clock.restore();

    clock = undefined;
  });


  it('should render', function() {

    // given
    const result = createTextField({ container });

    // then
    expect(domQuery('.bio-properties-panel-textfield', result.container)).to.exist;
  });


  it('should render placeholder', function() {

    // given
    const result = createTextField({ container, placeholder: 'test' });

    // then
    expect(domQuery('[placeholder=test]', result.container)).to.exist;
  });


  it('should update', function() {

    // given
    const updateSpy = sinon.spy();

    const result = createTextField({ container, setValue: updateSpy, debounce });

    const input = domQuery('.bio-properties-panel-input', result.container);

    // when
    changeInput(input, 'foo');
    clock.tick(500);

    // then
    expect(updateSpy).to.have.been.calledWith('foo');
  });


  it('should use unique input element on element change', function() {

    // given
    const result = createTextField({ element: {}, container });

    const input = domQuery('.bio-properties-panel-input', container);

    // when
    createTextField({ element: {}, container }, result.render);

    // then
    const newInput = domQuery('.bio-properties-panel-input', container);

    expect(newInput).to.not.eql(input);
  });


  it('should trim whitespace on blur', async function() {

    // given
    const setValueSpy = sinon.spy();

    const result = createTextField({
      container,
      setValue: setValueSpy,
      debounce
    });

    const input = domQuery('.bio-properties-panel-input', result.container);

    // when
    input.focus();
    changeInput(input, '  foo  ');
    input.blur();

    // then
    expect(setValueSpy).to.have.been.calledOnce;
    expect(setValueSpy).to.have.been.calledWith('foo');
  });


  it('should trigger update debounced', async function() {

    // given
    const setValueSpy = sinon.spy();

    const result = createTextField({
      id :'feel-1',
      container,
      debounce,
      setValue: setValueSpy
    });
    const input = domQuery('.bio-properties-panel-input', result.container);

    // when
    input.focus();
    changeInput(input, 'foo');
    changeInput(input, 'fooba');

    clock.tick(500);

    changeInput(input, 'foobab');

    clock.tick(500);

    // then
    expect(setValueSpy).to.have.been.calledTwice;
    expect(setValueSpy).to.have.been.calledWith('foobab');
  });


  it('should not trigger noop update on blur', async function() {

    // given
    const setValueSpy = sinon.spy();

    const result = createTextField({
      container,
      setValue: setValueSpy,
      getValue: () => 'foo',
      debounce
    });

    const input = domQuery('.bio-properties-panel-input', result.container);

    // when
    input.focus();
    changeInput(input, 'foobar');
    changeInput(input, 'foo');
    input.blur();

    // then
    expect(setValueSpy).not.to.have.been.called;
  });


  describe('#isEdited', function() {

    it('should NOT be edited', function() {

      // given
      const result = createTextField({ container });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      const edited = isEdited(input);

      // then
      expect(edited).to.be.false;
    });


    it('should be edited', function() {

      // given
      const result = createTextField({ container, getValue: () => 'foo' });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      const edited = isEdited(input);

      // then
      expect(edited).to.be.true;
    });


    it('should be edited after update', function() {

      // given
      const result = createTextField({ container, debounce });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // assume
      expect(isEdited(input)).to.be.false;

      // when
      changeInput(input, 'foo');
      clock.tick(500);

      // then
      expect(isEdited(input)).to.be.true;
    });

  });


  describe('events', function() {

    it('should show entry', function() {

      // given
      const eventBus = new EventBus();

      const onShowSpy = sinon.spy();

      createTextField({
        container,
        eventBus,
        id: 'foo',
        onShow: onShowSpy
      });

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

      const result = createTextField({ container, errors, id: 'foo' });

      // then
      expect(isValid(domQuery('.bio-properties-panel-entry', result.container))).to.be.false;
      expect(domQuery('.bio-properties-panel-error', result.container)).to.exist;
    });

  });


  describe('validation', function() {

    it('should set valid', function() {

      // given
      const validate = () => null;

      const result = createTextField({ container, validate, debounce });

      const entry = domQuery('.bio-properties-panel-entry', result.container);

      const input = domQuery('.bio-properties-panel-input', entry);

      // when
      changeInput(input, 'foo');
      clock.tick(500);

      // then
      expect(isValid(entry)).to.be.true;
    });


    it('should set invalid', function() {

      // given
      const validate = () => 'error';

      const result = createTextField({ container, validate, debounce });

      const entry = domQuery('.bio-properties-panel-entry', result.container);
      const input = domQuery('.bio-properties-panel-input', entry);

      // when
      changeInput(input, 'bar');
      clock.tick(500);

      // then
      expect(isValid(entry)).to.be.false;
    });


    it('should keep showing invalid value', function() {

      // given
      const validate = () => 'error';

      const result = createTextField({ container, validate, debounce });

      const entry = domQuery('.bio-properties-panel-entry', result.container);
      const input = domQuery('.bio-properties-panel-input', entry);

      // when
      changeInput(input, 'bar');
      clock.tick(500);

      // then
      expect(input.value).to.eql('bar');
    });


    it('should show error message', function() {

      // given
      const validate = () => 'error';

      const result = createTextField({ container, validate, debounce });

      const entry = domQuery('.bio-properties-panel-entry', result.container);
      const input = domQuery('.bio-properties-panel-input', entry);

      // when
      changeInput(input, 'bar');
      clock.tick(500);

      const error = domQuery('.bio-properties-panel-error', entry);

      // then
      expect(error).to.exist;
      expect(error.innerText).to.eql('error');
    });


    it('should NOT discard invalid input', function() {

      // given
      const setValueSpy = sinon.spy();
      const validate = () => 'error';

      const result = createTextField({ container, validate, setValue: setValueSpy, debounce });

      const entry = domQuery('.bio-properties-panel-entry', result.container);
      const input = domQuery('.bio-properties-panel-input', entry);

      // when
      changeInput(input, 'bar');
      clock.tick(500);

      // then
      expect(setValueSpy).to.have.been.calledWith('bar', 'error');
    });


    it('should check again if validation function changes', function() {

      // given
      let validate = () => 'error';

      const result = createTextField({ container, validate });
      const entry = domQuery('.bio-properties-panel-entry', result.container);

      // assume
      expect(isValid(entry)).to.be.false;

      // when
      validate = () => null;
      createTextField({ container, validate }, result.render);

      // then
      expect(isValid(entry)).to.be.true;
    });

  });


  describe('disabled', function() {

    it('should render enabled per default', function() {

      // given
      const result = createTextField({ container });

      // then
      const textInput = domQuery('.bio-properties-panel-textfield input', result.container);
      expect(textInput.disabled).to.be.false;
    });


    it('should render enabled if set', function() {

      // given
      const result = createTextField({
        container,
        disabled: false
      });

      // then
      const textInput = domQuery('.bio-properties-panel-textfield input', result.container);
      expect(textInput.disabled).to.be.false;
    });


    it('should render disabled if set', function() {

      // given
      const result = createTextField({
        container,
        disabled: true
      });

      // then
      const textInput = domQuery('.bio-properties-panel-textfield input', result.container);
      expect(textInput.disabled).to.be.true;
    });

  });


  describe('description', function() {

    it('should render without description per default', function() {

      // given
      const result = createTextField({
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
      const result = createTextField({
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

      const result = createTextField({
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

      const result = createTextField({
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


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);
      clock.restore();

      const { container: node } = createTextField({
        container,
        label: 'foo'
      });

      // then
      await expectNoViolations(node);
    });

  });

});


// helpers ////////////////////

function createTextField(options = {}, renderFn = render) {
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
    ...restProps
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
            <TextField
              { ...restProps }
              element={ element }
              id={ id }
              label={ label }
              description={ description }
              disabled={ disabled }
              getValue={ getValue }
              setValue={ setValue }
              debounce={ debounce }
              validate={ validate } />
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
