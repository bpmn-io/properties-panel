import { expect } from 'chai';

import { spy as sinonSpy } from 'sinon';

import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import EventBus from 'diagram-js/lib/core/EventBus';

import {
  clickInput,
  expectNoViolations,
  insertCoreStyles
} from 'test/TestHelper';

import {
  DescriptionContext,
  EventContext,
  PropertiesPanelContext
} from 'src/context';

import CheckboxGroup from 'src/components/entries/CheckboxGroup';

insertCoreStyles();

const noop = () => {};


describe('<CheckboxGroup>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should render empty', function() {

    // given
    const result = createCheckboxGroup({
      container,
      label: 'Checkbox Group',
      options: []
    });

    // then
    expect(domQuery('.bio-properties-panel-checkbox-group', result.container)).to.exist;

    const label = domQuery('.bio-properties-panel-group-header .bio-properties-panel-label', result.container);
    expect(label).to.exist;
    expect(label.innerText).to.include('Checkbox Group');
  });


  it('should render all options as checkboxes', function() {

    // given
    const options = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
      { label: 'Option 3', value: 'opt3' }
    ];

    const result = createCheckboxGroup({
      container,
      options
    });

    // then
    const checkboxes = domQueryAll('.bio-properties-panel-checkbox input', result.container);
    expect(checkboxes).to.have.lengthOf(3);
  });


  it('should render option labels', function() {

    // given
    const options = [
      { label: 'First Option', value: 'opt1' },
      { label: 'Second Option', value: 'opt2' }
    ];

    const result = createCheckboxGroup({
      container,
      options
    });

    // then
    const labels = domQueryAll('.bio-properties-panel-checkbox label', result.container);
    expect(labels[0].innerText).to.equal('First Option');
    expect(labels[1].innerText).to.equal('Second Option');
  });


  it('should mark checked options', function() {

    // given
    const options = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
      { label: 'Option 3', value: 'opt3' }
    ];

    const result = createCheckboxGroup({
      container,
      options,
      initialValue: [ 'opt1', 'opt3' ]
    });

    // then
    const checkboxes = domQueryAll('.bio-properties-panel-checkbox input', result.container);
    expect(checkboxes[0]).to.have.property('checked', true);
    expect(checkboxes[1]).to.have.property('checked', false);
    expect(checkboxes[2]).to.have.property('checked', true);
  });


  it('should call setValue when checkbox is clicked', function() {

    // given
    const setValueSpy = sinonSpy();
    const options = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' }
    ];

    const result = createCheckboxGroup({
      container,
      options,
      initialValue: [],
      setValue: setValueSpy
    });

    const checkboxes = domQueryAll('.bio-properties-panel-checkbox input', result.container);

    // when
    clickInput(checkboxes[0]);

    // then
    expect(setValueSpy).to.have.been.calledWith([ 'opt1' ]);
  });


  it('should add option to value on check', function() {

    // given
    const setValueSpy = sinonSpy();
    const options = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' }
    ];

    const result = createCheckboxGroup({
      container,
      options,
      initialValue: [ 'opt1' ],
      setValue: setValueSpy
    });

    const checkboxes = domQueryAll('.bio-properties-panel-checkbox input', result.container);

    // when
    clickInput(checkboxes[1]);

    // then
    expect(setValueSpy).to.have.been.calledWith([ 'opt1', 'opt2' ]);
  });


  it('should remove option from value on uncheck', function() {

    // given
    const setValueSpy = sinonSpy();
    const options = [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' }
    ];

    const result = createCheckboxGroup({
      container,
      options,
      initialValue: [ 'opt1', 'opt2' ],
      setValue: setValueSpy
    });

    const checkboxes = domQueryAll('.bio-properties-panel-checkbox input', result.container);

    // when
    clickInput(checkboxes[0]);

    // then
    expect(setValueSpy).to.have.been.calledWith([ 'opt2' ]);
  });


  it('should render disabled state', function() {

    // given
    const options = [
      { label: 'Option 1', value: 'opt1' }
    ];

    const result = createCheckboxGroup({
      container,
      options,
      disabled: true
    });

    // then
    const checkbox = domQuery('.bio-properties-panel-checkbox input', result.container);
    expect(checkbox).to.have.property('disabled', true);
  });


  describe('description', function() {

    it('should render with description', function() {

      // given
      const options = [ { label: 'Option 1', value: 'opt1' } ];

      const result = createCheckboxGroup({
        container,
        id: 'descriptionGroup',
        label: 'someLabel',
        description: 'my description',
        options
      });

      // then
      const description = domQuery('[data-entry-id="descriptionGroup"] .bio-properties-panel-description',
        result.container);

      expect(description).to.exist;
      expect(description.innerText).to.equal('my description');
    });

  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

      const options = [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' }
      ];

      const { container: node } = createCheckboxGroup({
        container,
        label: 'foo',
        options
      });

      // then
      await expectNoViolations(node);
    });

  });

});


// helpers ////////////////////

function createCheckboxGroup(options = {}) {
  const {
    element,
    id = 'checkboxGroup',
    label = 'Checkbox Group',
    container,
    descriptionConfig = {},
    getDescriptionForId = noop,
    eventBus = new EventBus(),
    onShow = noop,
    setValue = noop,
    initialValue = [],
    options: checkboxOptions = [],
    ...rest
  } = options;

  const getValue = () => initialValue;

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

  return render(
    <EventContext.Provider value={ eventContext }>
      <PropertiesPanelContext.Provider value={ propertiesPanelContext }>
        <DescriptionContext.Provider value={ descriptionContext }>
          <CheckboxGroup
            { ...rest }
            element={ element }
            id={ id }
            label={ label }
            options={ checkboxOptions }
            getValue={ getValue }
            setValue={ setValue } />
        </DescriptionContext.Provider>
      </PropertiesPanelContext.Provider>
    </EventContext.Provider>,
    {
      container
    }
  );
}
