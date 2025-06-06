import { act } from 'preact/test-utils';

import {
  render
} from '@testing-library/preact/pure';

import { waitFor } from '@testing-library/preact';

import TestContainer from 'mocha-test-container-support';

import {
  domify,
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

import TextArea, { isEdited } from 'src/components/entries/TextArea';

insertCoreStyles();

const noop = () => {};


describe('<TextArea>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should render', function() {

    // given
    const result = createTextArea({ container });

    // then
    expect(domQuery('.bio-properties-panel-textarea', result.container)).to.exist;
  });


  it('should render - monospace', function() {

    // given
    const result = createTextArea({ container, monospace: true });

    const input = domQuery('.bio-properties-panel-input', result.container);

    // then
    expect(domClasses(input).has('bio-properties-panel-input-monospace')).to.be.true;
  });


  it('should render disabled', function() {

    // given
    const result = createTextArea({ container, disabled: true });

    // then
    expect(
      domQuery('.bio-properties-panel-textarea textarea', result.container)
    ).to.have.property('disabled', true);
  });


  it('should render placeholder', function() {

    // given
    const result = createTextArea({ container, placeholder: 'test' });

    // then
    expect(domQuery('[placeholder=test]', result.container)).to.exist;
  });


  it('should update', function() {

    // given
    const updateSpy = sinon.spy();

    const result = createTextArea({ container, setValue: updateSpy });

    const input = domQuery('.bio-properties-panel-input', result.container);

    // when
    changeInput(input, 'foo');

    // then
    expect(updateSpy).to.have.been.calledWith('foo');
  });


  it('should use unique input element on element change', function() {

    // given
    const result = createTextArea({ element: {}, container });

    const input = domQuery('.bio-properties-panel-input', container);

    // when
    createTextArea({ element: {}, container }, result.render);

    // then
    const newInput = domQuery('.bio-properties-panel-input', container);

    expect(newInput).to.not.eql(input);
  });


  // https://github.com/bpmn-io/bpmn-js-properties-panel/issues/810
  it('should be flagged with data-gramm="false"', function() {

    // when
    createTextArea({ container });

    const input = domQuery('.bio-properties-panel-input', container);

    // then
    expect(input.dataset.gramm).to.eql('false');
  });

  it('should trim whitespace on blur', async function() {

    // given
    const setValueSpy = sinon.spy();

    const result = createTextArea({
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

    const result = createTextArea({
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

    const result = createTextArea({
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

      const firstRender = createTextArea({ container, setValue: updateSpies[0] });

      // when
      createTextArea({ container, setValue: updateSpies[1] }, firstRender.rerender);
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

      const firstRender = createTextArea({ container, getValue: getValueSpies[0] });

      // when
      createTextArea({ container, getValue: getValueSpies[1] }, firstRender.rerender);
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

      const firstRender = createTextArea({ container, validate: validateSpies[0] });

      // when
      createTextArea({ container, validate: validateSpies[1] }, firstRender.rerender);
      const input = domQuery('.bio-properties-panel-input', firstRender.container);
      validateSpies[0].resetHistory();

      // and when
      changeInput(input, 'foo');

      // then
      expect(validateSpies[0]).not.to.have.been.called;
      expect(validateSpies[1]).to.have.been.calledWith('foo');
    });
  });


  describe('events', function() {

    it('should show entry', function() {

      // given
      const eventBus = new EventBus();

      const onShowSpy = sinon.spy();

      createTextArea({
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

      const result = createTextArea({ container, errors, id: 'foo' });

      // then
      expect(isValid(domQuery('.bio-properties-panel-entry', result.container))).to.be.false;
      expect(domQuery('.bio-properties-panel-error', result.container)).to.exist;
    });

  });


  describe('#isEdited', function() {

    it('should NOT be edited', function() {

      // given
      const result = createTextArea({ container });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      const edited = isEdited(input);

      // then
      expect(edited).to.be.false;
    });


    it('should be edited', function() {

      // given
      const result = createTextArea({ container, getValue: () => 'foo' });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      const edited = isEdited(input);

      // then
      expect(edited).to.be.true;
    });


    it('should be edited after update', function() {

      // given
      const result = createTextArea({ container });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // assume
      expect(isEdited(input)).to.be.false;

      // when
      changeInput(input, 'foo');

      // then
      expect(isEdited(input)).to.be.true;
    });

  });


  describe('description', function() {

    it('should render without description per default', function() {

      // given
      const result = createTextArea({
        container,
        id: 'noDescriptionTextArea'
      });

      // then
      const description = domQuery('[data-entry-id="noDescriptionTextArea"] .bio-properties-panel-description',
        result.container);
      expect(description).not.to.exist;
    });


    it('should render with description if set per props', function() {

      // given
      const result = createTextArea({
        container,
        id: 'descriptionTextArea',
        label: 'someLabel',
        description: 'my description'
      });

      // then
      const description = domQuery('[data-entry-id="descriptionTextArea"] .bio-properties-panel-description',
        result.container);

      expect(description).to.exist;
      expect(description.innerText).to.equal('my description');
    });


    it('should render with description if set per context', function() {

      // given
      const descriptionConfig = { descriptionTextArea: (element) => 'myContextDesc' };

      const result = createTextArea({
        container,
        id: 'descriptionTextArea',
        label: 'someLabel',
        descriptionConfig,
        getDescriptionForId: (id, element) => descriptionConfig[id](element)
      });

      // then
      const description = domQuery('[data-entry-id="descriptionTextArea"] .bio-properties-panel-description',
        result.container);

      expect(description).to.exist;
      expect(description.innerText).to.equal('myContextDesc');
    });


    it('should render description set per props over context', function() {

      // given
      const descriptionConfig = { descriptionTextArea: (element) => 'myContextDesc' };

      const result = createTextArea({
        container,
        id: 'descriptionTextArea',
        label: 'someLabel',
        description: 'myExplicitDescription',
        descriptionConfig,
        getDescriptionForId: (id, element) => descriptionConfig[id](element)
      });

      // then
      const description = domQuery('[data-entry-id="descriptionTextArea"] .bio-properties-panel-description',
        result.container);

      expect(description).to.exist;
      expect(description.innerText).to.equal('myExplicitDescription');
    });

  });


  describe('validation', function() {

    it('should set valid', function() {

      // given
      const validate = () => null;

      const result = createTextArea({ container, validate });

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

      const result = createTextArea({ container, validate });

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

      const result = createTextArea({ container, validate });

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

      const result = createTextArea({ container, validate });

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

      const result = createTextArea({ container, validate, setValue: setValueSpy });

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

      const result = createTextArea({ container, validate });
      const entry = domQuery('.bio-properties-panel-entry', result.container);

      // assume
      expect(isValid(entry)).to.be.false;

      // when
      validate = () => null;
      createTextArea({ container, validate }, result.render);

      // then
      expect(isValid(entry)).to.be.true;
    });

  });


  describe('auto resize', function() {

    it('should resize initially', async function() {

      // given
      const result = createTextArea({
        container,
        id: 'textarea',
        getValue() {
          return `
            1
            2
            3
            4`;
        },
        autoResize: true
      });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      const initialHeight = input.clientHeight;

      // then
      await waitFor(() => {
        expect(initialHeight).to.be.greaterThan(60);
      });
    });


    it('should resize on input', function() {

      // given
      const result = createTextArea({
        container,
        id: 'textarea',
        autoResize: true
      });

      const input = domQuery('.bio-properties-panel-input', result.container);
      const initialHeight = input.clientHeight;

      // when
      changeInput(input, 'foo\nbar\nbar\nbar');
      const enlargedHeight = input.clientHeight;

      // then
      expect(enlargedHeight).to.be.greaterThan(initialHeight);

      // when
      changeInput(input, 'foo');
      const shrinkedHeight = input.clientHeight;

      // then
      expect(shrinkedHeight).to.be.lessThan(enlargedHeight);
    });


    it('should NOT resize on single line input when initially was display: none', function() {

      // given
      const parent = domify('<div style="display: none;"></div>');
      container.appendChild(parent);

      const style = domify('<style>.bio-properties-panel-input { box-sizing: border-box; }</style>');
      parent.appendChild(style);

      const result = createTextArea({
        container: parent,
        id: 'textarea',
        autoResize: true
      });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      parent.style.display = 'block';

      changeInput(input, 'foo');

      // then
      // no visual resize took place
      expect(input.clientHeight).to.be.lessThan(35);
    });


    it('should resize when becomes visible', async function() {

      // given
      const result = createTextArea({
        container,
        id: 'textarea',
        autoResize: true,
      });

      const input = domQuery('.bio-properties-panel-input', result.container);
      const initialHeight = input.clientHeight;

      // when
      changeInput(input, 'foo\nbar\nbar\nbar');
      result.container.style.display = 'none';
      const hiddenHeight = input.clientHeight;

      // then
      expect(hiddenHeight).to.be.eq(0);

      // when
      result.container.style.display = 'block';
      const visibleHeight = input.clientHeight;

      // then
      await waitFor(() => {
        expect(visibleHeight).to.be.greaterThan(initialHeight * 2);
      });
    });

  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

      const { container: node } = createTextArea({
        container,
        label: 'foo'
      });

      // then
      await expectNoViolations(node);
    });

  });

});


// helpers ////////////////////

function createTextArea(options = {}, renderFn = render) {
  const {
    element,
    id,
    description,
    debounce = fn => fn,
    label,
    getValue = noop,
    setValue = noop,
    onBlur = noop,
    rows,
    monospace,
    descriptionConfig = {},
    getDescriptionForId = noop,
    container,
    eventBus = new EventBus(),
    onShow = noop,
    errors = {},
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

  return renderFn(
    <ErrorsContext.Provider value={ errorsContext }>
      <EventContext.Provider value={ eventContext }>
        <PropertiesPanelContext.Provider value={ propertiesPanelContext }>
          <DescriptionContext.Provider value={ descriptionContext }>
            <TextArea
              { ...rest }
              element={ element }
              id={ id }
              label={ label }
              description={ description }
              getValue={ getValue }
              setValue={ setValue }
              onBlur={ onBlur }
              debounce={ debounce }
              rows={ rows }
              monospace={ monospace } />
          </DescriptionContext.Provider>
        </PropertiesPanelContext.Provider>
      </EventContext.Provider>
    </ErrorsContext.Provider>,
    { container });
}

function isValid(node) {
  return !domClasses(node).has('has-error');
}