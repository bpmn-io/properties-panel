import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery
} from 'min-dom';

import {
  clickInput,
  expectNoViolations,
  insertCoreStyles
} from 'test/TestHelper';

import ToggleSwitch, { isEdited } from 'src/components/entries/ToggleSwitch';

import {
  DescriptionContext
} from 'src/context';

insertCoreStyles();

const noop = () => {};

const TEST_TOGGLE_ID = 'checkbox1';


describe('<ToggleSwitch>', function() {

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


  describe('set checked according to value', function() {

    // [value, checked]
    const possibleValues = [
      [ true, true ],
      [ false, false ],
      [ undefined, false ],
      [ {}, true ]
    ];

    possibleValues.forEach(([ value, checked ]) => {

      it(`should set checked to ${checked} for ${value}`, function() {

        // when
        const result = createToggleSwitch({ container, getValue: () => value });

        // then
        const toggle = domQuery(`#bio-properties-panel-${TEST_TOGGLE_ID}`, result.container);

        expect(toggle.checked).to.equal(checked);

      });

    });

  });


  describe('update on external change', function() {

    // [initialValue, updatedValue, checked]
    const possibleValues = [
      [ true, false, false ],
      [ false, true, true ],
      [ undefined, {}, true ],
      [ {}, undefined, false ]
    ];

    possibleValues.forEach(([ initial, updated, checked ]) => {

      it(`should update ${initial} -> ${updated}`, function() {

        // given
        const givenFn = () => initial;
        const updatedFn = () => updated;
        const result = createToggleSwitch({ container, getValue: givenFn });

        // when
        createToggleSwitch({ container, getValue: updatedFn }, result.rerender);

        // then
        const toggle = domQuery(`#bio-properties-panel-${TEST_TOGGLE_ID}`, result.container);
        expect(toggle.checked).to.equal(checked);

      });

    });

  });


  it('should set labels', function() {

    // given
    const result = createToggleSwitch({
      container,
      label: 'myLabel',
      switcherLabel: 'mySwitcherLabel'
    });

    // then
    const label = domQuery(`.bio-properties-panel-label[for="bio-properties-panel-${TEST_TOGGLE_ID}"]`, result.container),
          switchLabel = domQuery('.bio-properties-panel-toggle-switch__label', result.container);

    expect(label.innerHTML).to.equal('myLabel');
    expect(switchLabel.innerHTML).to.equal('mySwitcherLabel');
  });


  it('should not set switcher label', function() {

    // given
    const result = createToggleSwitch({ container });

    // then
    expect(domQuery('.bio-properties-panel-toggle-switch__label', result.container)).to.not.exist;
  });


  it('should set inline', function() {

    // given
    const result = createToggleSwitch({ container, inline: true });

    const toggle = domQuery('.bio-properties-panel-toggle-switch', result.container);

    // then
    expect(toggle.classList.contains('inline')).to.be.true;
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


  describe('description', function() {

    it('should render without description per default', function() {

      // given
      const result = createToggleSwitch({
        container,
        id: 'noDescriptionToggleSwitch'
      });

      // then
      const description = domQuery('[data-entry-id="noDescriptionToggleSwitch"] .bio-properties-panel-description',
        result.container);
      expect(description).not.to.exist;
    });


    it('should render with description if set per props', function() {

      // given
      const result = createToggleSwitch({
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

      const result = createToggleSwitch({
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

      const result = createToggleSwitch({
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


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

      const { container: node } = createToggleSwitch({
        container,
        label: 'foo'
      });

      // then
      await expectNoViolations(node);
    });


    it('should have no violations - switcher label', async function() {

      // given
      this.timeout(5000);

      const { container: node } = createToggleSwitch({
        container,
        label: 'foo',
        switchLabel: 'on'
      });

      // then
      await expectNoViolations(node);
    });

  });

});


// helpers ////////////////////

function createToggleSwitch(options = {}, renderFn = render) {
  const {
    element,
    id = TEST_TOGGLE_ID,
    label,
    description,
    switcherLabel,
    inline,
    getValue = () => false,
    setValue = noop,
    descriptionConfig = {},
    getDescriptionForId = noop,
    container
  } = options;

  const context = {
    description: descriptionConfig,
    getDescriptionForId
  };

  return renderFn(
    <DescriptionContext.Provider value={ context }>
      <ToggleSwitch
        element={ element }
        id={ id }
        label={ label }
        description={ description }
        inline={ inline }
        getValue={ getValue }
        setValue={ setValue }
        switcherLabel={ switcherLabel } />
    </DescriptionContext.Provider>,
    {
      container
    }
  );
}
