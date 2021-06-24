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

import ToggleSwitch, { isEdited } from 'src/properties-panel/components/entries/ToggleSwitch';

insertCoreStyles();

const noop = () => {};

const TEST_TOGGLE_ID='checkbox1';


describe('<TextField>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should render', function() {

    // given
    const result = createToggleSwitch({ container });

    // then
    expect(domQuery('.bio-properties-panel-toggle-switch', result.container)).to.exist;
  });


  it('should update to true', function() {

    // given
    const updateSpy = sinon.spy();

    const result = createToggleSwitch({ container, setValue: updateSpy, getValue: () => false });

    const slider = domQuery('.bio-properties-panel-toggle-switch__slider', result.container);

    // when
    clickInput(slider);

    // then
    expect(updateSpy).to.have.been.calledWith(true);
  });


  it('should update to false', function() {

    // given
    const updateSpy = sinon.spy();

    const result = createToggleSwitch({ container, setValue: updateSpy, getValue: () => true });

    const slider = domQuery('.bio-properties-panel-toggle-switch__slider', result.container);

    // when
    clickInput(slider);

    // then
    expect(updateSpy).to.have.been.calledWith(false);
  });


  it('should set checked according to value', function() {

    // given
    const getValueFunctions = [
      () => true,
      () => false
    ];

    getValueFunctions.forEach(fn => {

      // when
      const result = createToggleSwitch({ container, getValue: fn });

      // then
      const toggle = domQuery(`#bio-properties-panel-${TEST_TOGGLE_ID}`, result.container);

      expect(toggle.checked).to.equal(fn());
    });
  });


  it('should set labels and description', function() {

    // given
    const result = createToggleSwitch({
      container,
      description: 'myDescription',
      label: 'myLabel',
      switcherLabel: 'mySwitcherLabel'
    });

    // then
    const label = domQuery(`.bio-properties-panel-label[for="bio-properties-panel-${TEST_TOGGLE_ID}"]`, result.container),
          switchLabel = domQuery('.bio-properties-panel-toggle-switch__label', result.container),
          description = domQuery('.bio-properties-panel-description', result.container);

    expect(label.innerHTML).to.equal('myLabel');
    expect(switchLabel.innerHTML).to.equal('mySwitcherLabel');
    expect(description.innerHTML).to.equal('myDescription');
  });



  describe('#isEdited', function() {

    it('should NOT be edited', function() {

      // given
      const result = createToggleSwitch({ container });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      const edited = isEdited(input);

      // then
      expect(edited).to.be.false;
    });


    it('should be edited', function() {

      // given
      const result = createToggleSwitch({ container, getValue: () => 'foo' });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      const edited = isEdited(input);

      // then
      expect(edited).to.be.true;
    });


    it('should be edited after update', function() {

      // given
      const result = createToggleSwitch({ container });

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

function createToggleSwitch(options = {}) {
  const {
    id=TEST_TOGGLE_ID,
    label,
    description,
    switcherLabel,
    getValue = () => false,
    setValue = noop,
    container
  } = options;

  return render(
    <ToggleSwitch
      id={ id }
      label={ label }
      description={ description }
      getValue={ getValue }
      setValue={ setValue }
      switcherLabel={ switcherLabel } />,
    {
      container
    }
  );
}
