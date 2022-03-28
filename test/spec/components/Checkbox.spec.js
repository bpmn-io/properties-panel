import { act } from 'preact/test-utils';

import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery
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


  it('should render disabled', function() {

    // given
    const result = createCheckbox({ container, disabled: true });

    // then
    expect(
      domQuery('.bio-properties-panel-checkbox input', result.container)
    ).to.have.property('disabled', true);
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


  describe('events', function() {

    it('should show entry', function() {

      // given
      const eventBus = new EventBus();

      const onShowSpy = sinon.spy();

      const show = () => true;

      createCheckbox({ container, eventBus, onShow: onShowSpy, show });

      // when
      act(() => eventBus.fire('propertiesPanel.showEntry'));

      // then
      expect(onShowSpy).to.have.been.called;
    });


    it('should show error', function() {

      // given
      const eventBus = new EventBus();

      const onShowSpy = sinon.spy();

      const show = () => true;

      const result = createCheckbox({ container, eventBus, onShow: onShowSpy, show });

      // when
      act(() => eventBus.fire('propertiesPanel.showError', { message: 'foo' }));

      // then
      expect(onShowSpy).to.have.been.called;

      expect(domQuery('.bio-properties-panel-error'), result.container).to.exist;
    });

  });


  describe('description', function() {

    it('should render without description per default', function() {

      // given
      const result = createCheckbox({
        container,
        id: 'noDescriptionCheckbox'
      });

      // then
      const description = domQuery('[data-entry-id="noDescriptionCheckbox"] .bio-properties-panel-description',
        result.container);
      expect(description).not.to.exist;
    });


    it('should render with description if set per props', function() {

      // given
      const result = createCheckbox({
        container,
        id: 'descriptionCheckbox',
        label: 'someLabel',
        description: 'my description'
      });

      // then
      const description = domQuery('[data-entry-id="descriptionCheckbox"] .bio-properties-panel-description',
        result.container);

      expect(description).to.exist;
      expect(description.innerText).to.equal('my description');
    });


    it('should render with description if set per context', function() {

      // given
      const descriptionConfig = { descriptionCheckbox: (element) => 'myContextDesc' };

      const result = createCheckbox({
        container,
        id: 'descriptionCheckbox',
        label: 'someLabel',
        descriptionConfig,
        getDescriptionForId: (id, element) => descriptionConfig[id](element)
      });

      // then
      const description = domQuery('[data-entry-id="descriptionCheckbox"] .bio-properties-panel-description',
        result.container);

      expect(description).to.exist;
      expect(description.innerText).to.equal('myContextDesc');
    });


    it('should render description set per props over context', function() {

      // given
      const descriptionConfig = { descriptionCheckbox: (element) => 'myContextDesc' };

      const result = createCheckbox({
        container,
        id: 'descriptionCheckbox',
        label: 'someLabel',
        description: 'myExplicitDescription',
        descriptionConfig,
        getDescriptionForId: (id, element) => descriptionConfig[id](element)
      });

      // then
      const description = domQuery('[data-entry-id="descriptionCheckbox"] .bio-properties-panel-description',
        result.container);

      expect(description).to.exist;
      expect(description.innerText).to.equal('myExplicitDescription');
    });

  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      const { container: node } = createCheckbox({
        container,
        label: 'foo'
      });

      // then
      await expectNoViolations(node);
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
    container,
    descriptionConfig = {},
    getDescriptionForId = noop,
    eventBus = new EventBus(),
    onShow = noop,
    show,
    ...rest
  } = options;

  const eventContext = {
    eventBus
  };

  const propertiesPanelContext = {
    onShow
  };

  const decriptionContext = {
    description: descriptionConfig,
    getDescriptionForId
  };

  return render(
    <EventContext.Provider value={ eventContext }>
      <PropertiesPanelContext.Provider value={ propertiesPanelContext }>
        <DescriptionContext.Provider value={ decriptionContext }>
          <Checkbox
            { ...rest }
            element={ element }
            id={ id }
            label={ label }
            getValue={ getValue }
            setValue={ setValue }
            show={ show } />
        </DescriptionContext.Provider>
      </PropertiesPanelContext.Provider>
    </EventContext.Provider>,
    {
      container
    }
  );
}
