import { expect } from 'chai';

import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery
} from 'min-dom';

import EventBus from 'diagram-js/lib/core/EventBus';

import {
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


  it('should render', function() {

    // given
    const result = createCheckboxGroup({
      container,
      label: 'Checkbox Group'
    });

    // then
    expect(domQuery('.bio-properties-panel-checkbox-group', result.container)).to.exist;

    const label = domQuery('.bio-properties-panel-group-header .bio-properties-panel-label', result.container);
    expect(label).to.exist;
    expect(label.innerText).to.include('Checkbox Group');
  });


  it('should render children', function() {

    // given
    const children = [
      <div key="1" class="test-child-1">Child 1</div>,
      <div key="2" class="test-child-2">Child 2</div>
    ];

    const result = createCheckboxGroup({
      container,
      children
    });

    // then
    expect(domQuery('.test-child-1', result.container)).to.exist;
    expect(domQuery('.test-child-2', result.container)).to.exist;
  });


  it('should render description', function() {

    // given
    const result = createCheckboxGroup({
      container,
      id: 'descriptionGroup',
      label: 'someLabel',
      description: 'my description'
    });

    // then
    const description = domQuery('[data-entry-id="descriptionGroup"] .bio-properties-panel-description',
      result.container);

    expect(description).to.exist;
    expect(description.innerText).to.equal('my description');
  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

      const { container: node } = createCheckboxGroup({
        container,
        label: 'foo'
      });

      // then
      await expectNoViolations(node);
    });

  });

});


// helpers ////////////////////

function createCheckboxGroup(options = {}, renderFn = render) {
  const {
    element,
    id = 'checkboxGroup',
    label = 'Checkbox Group',
    container,
    descriptionConfig = {},
    getDescriptionForId = noop,
    eventBus = new EventBus(),
    onShow = noop,
    children,
    ...rest
  } = options;

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
    <EventContext.Provider value={ eventContext }>
      <PropertiesPanelContext.Provider value={ propertiesPanelContext }>
        <DescriptionContext.Provider value={ descriptionContext }>
          <CheckboxGroup
            { ...rest }
            element={ element }
            id={ id }
            label={ label }>
            { children }
          </CheckboxGroup>
        </DescriptionContext.Provider>
      </PropertiesPanelContext.Provider>
    </EventContext.Provider>,
    {
      container
    }
  );
}
