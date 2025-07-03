import { act } from 'preact/test-utils';

import {
  render,
  fireEvent,
  findByText
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

import TextField, { isEdited } from 'src/components/entries/TextField';

insertCoreStyles();

const noop = () => {};


describe('<TextField>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
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

    const result = createTextField({ container, setValue: updateSpy });

    const input = domQuery('.bio-properties-panel-input', result.container);

    // when
    changeInput(input, 'foo');

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

    const result = createTextField({
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

    const result = createTextField({
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

      const firstRender = createTextField({ container, setValue: updateSpies[0] });

      // when
      createTextField({ container, setValue: updateSpies[1] }, firstRender.rerender);
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

      const firstRender = createTextField({ container, getValue: getValueSpies[0] });

      // when
      createTextField({ container, getValue: getValueSpies[1] }, firstRender.rerender);
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

      const firstRender = createTextField({ container, validate: validateSpies[0] });

      // when
      createTextField({ container, validate: validateSpies[1] }, firstRender.rerender);
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
      const result = createTextField({ container });

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

      const result = createTextField({ container, validate });

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

      const result = createTextField({ container, validate });

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

      const result = createTextField({ container, validate });

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

      const result = createTextField({ container, validate });

      const entry = domQuery('.bio-properties-panel-entry', result.container);
      const input = domQuery('.bio-properties-panel-input', entry);

      // when
      changeInput(input, 'bar');

      const error = domQuery('.bio-properties-panel-error', entry);

      // then
      expect(error).to.exist;
      expect(error.innerText).to.eql('error');
    });


    it('should NOT discard invalid input', function() {

      // given
      const setValueSpy = sinon.spy();
      const validate = () => 'error';

      const result = createTextField({ container, validate, setValue: setValueSpy });

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


  describe('tooltip', function() {

    it('should render tooltip', async function() {

      // given
      const result = createTextField({ container, tooltip: 'tooltip-test' });

      // when
      fireEvent.mouseEnter(domQuery('.bio-properties-panel-tooltip-wrapper', result.container));

      // then
      await findByText(result.container, 'tooltip-test');
    });
  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

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
    onBlur = noop,
    descriptionConfig = {},
    getDescriptionForId = noop,
    container,
    eventBus = new EventBus(),
    onShow = noop,
    errors = {},
    tooltip,
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
              onBlur={ onBlur }
              debounce={ debounce }
              validate={ validate }
              tooltip={ tooltip }
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
