import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  classes as domClasses,
  query as domQuery
} from 'min-dom';

import {
  insertCoreStyles,
  changeInput
} from 'test/TestHelper';

import {
  DescriptionContext
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


  describe('validation', function() {

    it('should set valid', function() {

      // given
      const validate = (v) => {
        if (v === 'bar') {
          return 'error';
        }
      };

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
      const validate = (v) => {
        if (v === 'bar') {
          return 'error';
        }
      };

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
      const validate = (v) => {
        if (v === 'bar') {
          return 'error';
        }
      };

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
      const validate = (v) => {
        if (v === 'bar') {
          return 'error';
        }
      };

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
        id: 'noDescriptionTextField',
        label: 'someLabel',
        description: 'my description'
      });

      // then
      const description = domQuery('[data-entry-id="noDescriptionTextField"] .bio-properties-panel-description',
        result.container);

      expect(description).to.exist;
      expect(description.innerText).to.equal('my description');
    });


    it('should render with description if set per context', function() {

      // given
      const descriptionContext = { noDescriptionTextField: (element) => 'myContextDesc' };

      const result = createTextField({
        container,
        id: 'noDescriptionTextField',
        label: 'someLabel',
        descriptionContext,
        getDescriptionForId: (id, element) => descriptionContext[id](element)
      });

      // then
      const description = domQuery('[data-entry-id="noDescriptionTextField"] .bio-properties-panel-description',
        result.container);

      expect(description).to.exist;
      expect(description.innerText).to.equal('myContextDesc');
    });


    it('should render description set per props over context', function() {

      // given
      const descriptionContext = { noDescriptionTextField: (element) => 'myContextDesc' };

      const result = createTextField({
        container,
        id: 'noDescriptionTextField',
        label: 'someLabel',
        description: 'myExplicitDescription',
        descriptionContext,
        getDescriptionForId: (id, element) => descriptionContext[id](element)
      });

      // then
      const description = domQuery('[data-entry-id="noDescriptionTextField"] .bio-properties-panel-description',
        result.container);

      expect(description).to.exist;
      expect(description.innerText).to.equal('myExplicitDescription');
    });

  });

});


// helpers ////////////////////

function createTextField(options = {}) {
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
    container,
    descriptionContext = {},
    getDescriptionForId = noop,
    setDescriptionForId = noop
  } = options;

  const context = {
    description: descriptionContext,
    getDescriptionForId,
    setDescriptionForId
  };

  return render(
    <DescriptionContext.Provider value={ context }>
      <TextField
        element={ element }
        id={ id }
        label={ label }
        description={ description }
        disabled={ disabled }
        getValue={ getValue }
        setValue={ setValue }
        debounce={ debounce }
        validate={ validate } />
    </DescriptionContext.Provider>,
    {
      container
    }
  );
}

function isValid(node) {
  return !domClasses(node).has('has-error');
}
