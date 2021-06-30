import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery
} from 'min-dom';

import {
  insertCoreStyles,
  clickInput
} from 'test/TestHelper';

import Checkbox, { isEdited } from 'src/components/entries/Checkbox';

insertCoreStyles();

const noop = () => {};


describe('<Checkbox>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should render', function() {

    // given
    const result = createCheckbox({ container });

    // then
    expect(domQuery('.bio-properties-panel-checkbox', result.container)).to.exist;
  });


  it('should update', function() {

    // given
    const updateSpy = sinon.spy();

    const result = createCheckbox({ container, setValue: updateSpy });

    const input = domQuery('.bio-properties-panel-input', result.container);

    // when
    clickInput(input);

    // then
    expect(updateSpy).to.have.been.calledWith(true);
  });


  describe('#isEdited', function() {

    it('should NOT be edited', function() {

      // given
      const result = createCheckbox({ container });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      const edited = isEdited(input);

      // then
      expect(edited).to.be.false;
    });


    it('should be edited', function() {

      // given
      const result = createCheckbox({ container, getValue: () => 'foo' });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      const edited = isEdited(input);

      // then
      expect(edited).to.be.true;
    });


    it('should be edited after update', function() {

      // given
      const result = createCheckbox({ container });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // assume
      expect(isEdited(input)).to.be.false;

      // when
      clickInput(input);

      // then
      expect(isEdited(input)).to.be.true;
    });

  });

});


// helpers ////////////////////

function createCheckbox(options = {}) {
  const {
    element,
    id,
    label,
    getValue = noop,
    setValue = noop,
    container
  } = options;

  return render(
    <Checkbox
      element={ element }
      id={ id }
      label={ label }
      getValue={ getValue }
      setValue={ setValue } />,
    {
      container
    }
  );
}