import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  classes as domClasses,
  query as domQuery
} from 'min-dom';

import {
  changeInput,
  expectNoViolations,
  insertCoreStyles
} from 'test/TestHelper';

import NumberField, { isEdited } from 'src/components/entries/NumberField';

import {
  DescriptionContext,
  ErrorsContext
} from 'src/context';

insertCoreStyles();

const noop = () => {};


describe('<NumberField>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should render', function() {

    // given
    const result = createNumberField({ container });

    // then
    expect(domQuery('.bio-properties-panel-numberfield', result.container)).to.exist;
  });


  it('should update', function() {

    // given
    const updateSpy = sinon.spy();

    const result = createNumberField({ container, setValue: updateSpy });

    const input = domQuery('.bio-properties-panel-input', result.container);

    // when
    changeInput(input, 20);

    // then
    expect(updateSpy).to.have.been.calledWith(20);
  });


  it('should update (floating point number)', function() {

    // given
    const updateSpy = sinon.spy();

    const result = createNumberField({ container, setValue: updateSpy, step: 'any' });

    const input = domQuery('.bio-properties-panel-input', result.container);

    // when
    changeInput(input, 20.5);

    // then
    expect(updateSpy).to.have.been.calledWith(20.5);
  });


  it('should update (undefined)', function() {

    // given
    const updateSpy = sinon.spy();

    const result = createNumberField({ container, setValue: updateSpy });

    const input = domQuery('.bio-properties-panel-input', result.container);

    // when
    changeInput(input, '');

    // then
    expect(updateSpy).to.have.been.calledWith(undefined);
  });


  it('should NOT update on invalid', function() {

    // given
    const updateSpy = sinon.spy();

    const step = '3';

    const result = createNumberField({ container, setValue: updateSpy, step });

    const input = domQuery('.bio-properties-panel-input', result.container);

    // when
    changeInput(input, 20);

    // then
    expect(updateSpy).to.not.have.been.called;
  });


  it('should use unique input element on element change', function() {

    // given
    const result = createNumberField({ element: {}, container });

    const input = domQuery('.bio-properties-panel-input', container);

    // when
    createNumberField({ element: {}, container }, result.render);

    // then
    const newInput = domQuery('.bio-properties-panel-input', container);

    expect(newInput).to.not.eql(input);
  });


  describe('#isEdited', function() {

    it('should NOT be edited', function() {

      // given
      const result = createNumberField({ container });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      const edited = isEdited(input);

      // then
      expect(edited).to.be.false;
    });


    it('should be edited', function() {

      // given
      const result = createNumberField({ container, getValue: () => 20 });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      const edited = isEdited(input);

      // then
      expect(edited).to.be.true;
    });


    it('should be edited after update', function() {

      // given
      const result = createNumberField({ container });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // assume
      expect(isEdited(input)).to.be.false;

      // when
      changeInput(input, 20);

      // then
      expect(isEdited(input)).to.be.true;
    });

  });

  describe('errors', function() {

    it('should get error', function() {

      // given
      const errors = {
        foo: 'bar'
      };

      const result = createNumberField({ container, errors, id: 'foo' });

      // then
      expect(isValid(domQuery('.bio-properties-panel-entry', result.container))).to.be.false;
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

      const result = createNumberField({ container, validate });

      const entry = domQuery('.bio-properties-panel-entry', result.container);

      const input = domQuery('.bio-properties-panel-input', entry);

      // when
      changeInput(input, 2);

      // then
      expect(isValid(entry)).to.be.true;
    });


    it('should set invalid', function() {

      // given
      const validate = (v) => {
        if (v % 2 !== 0) {
          return 'should be even';
        }
      };

      const result = createNumberField({ container, validate });

      const entry = domQuery('.bio-properties-panel-entry', result.container);
      const input = domQuery('.bio-properties-panel-input', entry);

      // when
      changeInput(input, 3);

      // then
      expect(isValid(entry)).to.be.false;
    });


    it('should keep showing invalid value', function() {

      // given
      const validate = (v) => {
        if (v % 2 !== 0) {
          return 'should be even';
        }
      };

      const result = createNumberField({ container, validate });

      const entry = domQuery('.bio-properties-panel-entry', result.container);
      const input = domQuery('.bio-properties-panel-input', entry);

      // when
      changeInput(input, 3);

      // then
      expect(input.value).to.eql('3');
    });


    it('should show error message', function() {

      // given
      const validate = (v) => {
        if (v % 2 !== 0) {
          return 'should be even';
        }
      };

      const result = createNumberField({ container, validate });

      const entry = domQuery('.bio-properties-panel-entry', result.container);
      const input = domQuery('.bio-properties-panel-input', entry);

      // when
      changeInput(input, 3);

      const error = domQuery('.bio-properties-panel-error', entry);

      // then
      expect(error).to.exist;
      expect(error.innerText).to.eql('should be even');
    });

  });


  describe('disabled', function() {

    it('should render enabled per default', function() {

      // given
      const result = createNumberField({ container });

      // then
      const input = domQuery('.bio-properties-panel-input', result.container);
      expect(input.disabled).to.be.false;
    });


    it('should render enabled if set', function() {

      // given
      const result = createNumberField({
        container,
        disabled: false
      });

      // then
      const input = domQuery('.bio-properties-panel-input', result.container);
      expect(input.disabled).to.be.false;
    });


    it('should render disabled if set', function() {

      // given
      const result = createNumberField({
        container,
        disabled: true
      });

      // then
      const input = domQuery('.bio-properties-panel-input', result.container);
      expect(input.disabled).to.be.true;
    });

  });


  describe('description', function() {

    it('should render without description per default', function() {

      // given
      const result = createNumberField({
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
      const result = createNumberField({
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

      const result = createNumberField({
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

      const result = createNumberField({
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


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

      const { container: node } = createNumberField({
        container,
        label: 'foo'
      });

      // then
      await expectNoViolations(node);
    });

  });

});


// helpers ////////////////////

function createNumberField(options = {}, renderFn = render) {
  const {
    element,
    debounce = fn => fn,
    description,
    disabled,
    getValue = noop,
    id,
    label,
    max,
    min,
    setValue = noop,
    validate = noop,
    step,
    descriptionConfig = {},
    getDescriptionForId = noop,
    container,
    errors = {}
  } = options;

  const errorsContext = {
    errors
  };

  const context = {
    description: descriptionConfig,
    getDescriptionForId
  };

  return renderFn(
    <ErrorsContext.Provider value={ errorsContext }>
      <DescriptionContext.Provider value={ context }>
        <NumberField
          element={ element }
          debounce={ debounce }
          description={ description }
          disabled={ disabled }
          getValue={ getValue }
          id={ id }
          label={ label }
          max={ max }
          min={ min }
          setValue={ setValue }
          step={ step }
          validate={ validate } />
      </DescriptionContext.Provider>
    </ErrorsContext.Provider>
    ,
    {
      container
    }
  );
}

function isValid(node) {
  return !domClasses(node).has('has-error');
}