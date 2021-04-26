import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery
} from 'min-dom';

import {
  insertCoreStyles,
  triggerInput
} from 'test/TestHelper';

import TextField from 'src/properties-panel/components/entries/TextField';

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
    triggerInput(input, 'foo');

    // then
    expect(updateSpy).to.have.been.calledWith('foo');
  });

});


// helpers ////////////////////

function createTextField(options = {}) {
  const {
    element,
    id,
    description,
    debounce,
    label,
    getValue = noop,
    setValue = noop,
    container
  } = options;

  return render(
    <TextField
      element={ element }
      id={ id }
      label={ label }
      description={ description }
      getValue={ getValue }
      setValue={ setValue }
      debounce={ debounce } />,
    container);
}