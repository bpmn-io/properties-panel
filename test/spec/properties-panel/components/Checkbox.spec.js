import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery
} from 'min-dom';

import {
  insertCoreStyles,
  triggerEvent
} from 'test/TestHelper';

import Checkbox from 'src/properties-panel/components/entries/Checkbox';

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
    triggerEvent(input, 'click');

    // then
    expect(updateSpy).to.have.been.calledWith(true);
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
    container);
}