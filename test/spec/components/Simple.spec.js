import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery
} from 'min-dom';

import {
  changeInput,
  expectNoViolations,
  insertCoreStyles
} from 'test/TestHelper';

import Simple, { isEdited } from 'src/components/entries/Simple';

insertCoreStyles();

const noop = () => {};


describe('<Simple>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should render', function() {

    // given
    const result = createSimple({ container });

    // then
    expect(domQuery('.bio-properties-panel-simple', result.container)).to.exist;
  });


  it('should update', function() {

    // given
    const updateSpy = sinon.spy();

    const result = createSimple({ container, setValue: updateSpy });

    const input = domQuery('.bio-properties-panel-input', result.container);

    // when
    changeInput(input, 'foo');

    // then
    expect(updateSpy).to.have.been.calledWith('foo');
  });


  it('should use unique input element on element change', function() {

    // given
    const result = createSimple({ element: {}, container });

    const input = domQuery('.bio-properties-panel-input', container);

    // when
    createSimple({ element: {}, container }, result.render);

    // then
    const newInput = domQuery('.bio-properties-panel-input', container);

    expect(newInput).to.not.eql(input);
  });


  it('should NOT blow up on empty value', function() {

    // given
    const updateSpy = sinon.spy();

    const result = createSimple({ container, setValue: updateSpy });

    const input = domQuery('.bio-properties-panel-input', result.container);

    // when
    changeInput(input, undefined);

    // then
    expect(updateSpy).to.have.been.calledWith(undefined);
  });


  describe('#isEdited', function() {

    it('should NOT be edited', function() {

      // given
      const result = createSimple({ container });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      const edited = isEdited(input);

      // then
      expect(edited).to.be.false;
    });


    it('should be edited', function() {

      // given
      const result = createSimple({ container, getValue: () => 'foo' });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      const edited = isEdited(input);

      // then
      expect(edited).to.be.true;
    });


    it('should be edited after update', function() {

      // given
      const result = createSimple({ container });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // assume
      expect(isEdited(input)).to.be.false;

      // when
      changeInput(input, 'foo');

      // then
      expect(isEdited(input)).to.be.true;
    });

  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

      const getValue = () => '';

      const { container: node } = createSimple({
        container,
        getValue
      });

      // then
      await expectNoViolations(node);
    });


    it('should set aria label', async function() {

      // given
      this.timeout(5000);

      const getValue = () => 'foo';

      const { container: node } = createSimple({
        container,
        getValue
      });

      // then
      await expectNoViolations(node, {
        runOnly: [ 'label' ]
      });
    });


    it('should set aria label (empty value)', async function() {

      // given
      this.timeout(5000);

      const getValue = () => null;

      const { container: node } = createSimple({
        container,
        getValue
      });

      // then
      await expectNoViolations(node, {
        runOnly: [ 'label' ]
      });
    });

  });

});


// helpers ////////////////////

function createSimple(options = {}, renderFn = render) {
  const {
    element,
    id,
    debounce = fn => fn,
    disabled,
    getValue = noop,
    setValue = noop,
    container
  } = options;

  return renderFn(
    <Simple
      element={ element }
      id={ id }
      debounce={ debounce }
      disabled={ disabled }
      getValue={ getValue }
      setValue={ setValue } />,
    { container });
}