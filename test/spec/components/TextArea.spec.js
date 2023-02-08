import { act } from 'preact/test-utils';

import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  domify,
  classes as domClasses,
  query as domQuery
} from 'min-dom';

import EventBus from 'diagram-js/lib/core/EventBus';

import {
  changeInput,
  expectNoViolations,
  insertCoreStyles
} from 'test/TestHelper';

import {
  DescriptionContext,
  ErrorsContext,
  EventContext,
  PropertiesPanelContext
} from 'src/context';

import TextArea, { isEdited } from 'src/components/entries/TextArea';

insertCoreStyles();

const noop = () => {};


describe('<TextArea>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should render', function() {

    // given
    const result = createTextArea({ container });

    // then
    expect(domQuery('.bio-properties-panel-textarea', result.container)).to.exist;
  });


  it('should render - monospace', function() {

    // given
    const result = createTextArea({ container, monospace: true });

    const input = domQuery('.bio-properties-panel-input', result.container);

    // then
    expect(domClasses(input).has('bio-properties-panel-input-monospace')).to.be.true;
  });


  it('should render disabled', function() {

    // given
    const result = createTextArea({ container, disabled: true });

    // then
    expect(
      domQuery('.bio-properties-panel-textarea textarea', result.container)
    ).to.have.property('disabled', true);
  });


  it('should update', function() {

    // given
    const updateSpy = sinon.spy();

    const result = createTextArea({ container, setValue: updateSpy });

    const input = domQuery('.bio-properties-panel-input', result.container);

    // when
    changeInput(input, 'foo');

    // then
    expect(updateSpy).to.have.been.calledWith('foo');
  });


  it('should use unique input element on element change', function() {

    // given
    const result = createTextArea({ element: {}, container });

    const input = domQuery('.bio-properties-panel-input', container);

    // when
    createTextArea({ element: {}, container }, result.render);

    // then
    const newInput = domQuery('.bio-properties-panel-input', container);

    expect(newInput).to.not.eql(input);
  });


  // https://github.com/bpmn-io/bpmn-js-properties-panel/issues/810
  it('should be flagged with data-gramm="false"', function() {

    // when
    createTextArea({ container });

    const input = domQuery('.bio-properties-panel-input', container);

    // then
    expect(input.dataset.gramm).to.eql('false');
  });


  describe('events', function() {

    it('should show entry', function() {

      // given
      const eventBus = new EventBus();

      const onShowSpy = sinon.spy();

      createTextArea({
        container,
        eventBus,
        id: 'foo',
        onShow: onShowSpy
      });

      // when
      act(() => eventBus.fire('propertiesPanel.showEntry', { id: 'foo' }));

      // then
      expect(onShowSpy).to.have.been.called;
    });

  });


  describe('errors', function() {

    it('should get error', function() {

      // given
      const errors = {
        foo: 'bar'
      };

      const result = createTextArea({ container, errors, id: 'foo' });

      // then
      expect(isValid(domQuery('.bio-properties-panel-entry', result.container))).to.be.false;
      expect(domQuery('.bio-properties-panel-error', result.container)).to.exist;
    });

  });


  describe('#isEdited', function() {

    it('should NOT be edited', function() {

      // given
      const result = createTextArea({ container });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      const edited = isEdited(input);

      // then
      expect(edited).to.be.false;
    });


    it('should be edited', function() {

      // given
      const result = createTextArea({ container, getValue: () => 'foo' });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      const edited = isEdited(input);

      // then
      expect(edited).to.be.true;
    });


    it('should be edited after update', function() {

      // given
      const result = createTextArea({ container });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // assume
      expect(isEdited(input)).to.be.false;

      // when
      changeInput(input, 'foo');

      // then
      expect(isEdited(input)).to.be.true;
    });

  });


  describe('description', function() {

    it('should render without description per default', function() {

      // given
      const result = createTextArea({
        container,
        id: 'noDescriptionTextArea'
      });

      // then
      const description = domQuery('[data-entry-id="noDescriptionTextArea"] .bio-properties-panel-description',
        result.container);
      expect(description).not.to.exist;
    });


    it('should render with description if set per props', function() {

      // given
      const result = createTextArea({
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

      const result = createTextArea({
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

      const result = createTextArea({
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


  describe('auto resize', function() {

    it('should resize initially', function() {

      // given
      const result = createTextArea({
        container,
        id: 'textarea',
        getValue() {
          return `
HALLO
WELT
WIE
GEHTS
`;
        },
        autoResize: true
      });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      const initialHeight = input.clientHeight;

      // then
      expect(initialHeight).to.be.greaterThan(60);
    });


    it('should resize on input', function() {

      // given
      const result = createTextArea({
        container,
        id: 'textarea',
        autoResize: true
      });

      const input = domQuery('.bio-properties-panel-input', result.container);
      const initialHeight = input.clientHeight;

      // when
      changeInput(input, 'foo\nbar\nbar\nbar');
      const enlargedHeight = input.clientHeight;

      // then
      expect(enlargedHeight).to.be.greaterThan(initialHeight);

      // when
      changeInput(input, 'foo');
      const shrinkedHeight = input.clientHeight;

      // then
      expect(shrinkedHeight).to.be.lessThan(enlargedHeight);
    });


    it('should NOT resize on single line input when initially was display: none', function() {

      // given
      const parent = domify('<div style="display: none;"></div>');
      container.appendChild(parent);

      const style = domify('<style>.bio-properties-panel-input { box-sizing: border-box; }</style>');
      parent.appendChild(style);

      const result = createTextArea({
        container: parent,
        id: 'textarea',
        autoResize: true
      });

      const input = domQuery('.bio-properties-panel-input', result.container);

      // when
      parent.style.display = 'block';

      changeInput(input, 'foo');

      // then
      // no visual resize took place
      expect(input.clientHeight).to.be.lessThan(35);
    });

  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

      const { container: node } = createTextArea({
        container,
        label: 'foo'
      });

      // then
      await expectNoViolations(node);
    });

  });

});


// helpers ////////////////////

function createTextArea(options = {}, renderFn = render) {
  const {
    element,
    id,
    description,
    debounce = fn => fn,
    label,
    getValue = noop,
    setValue = noop,
    rows,
    monospace,
    descriptionConfig = {},
    getDescriptionForId = noop,
    container,
    eventBus = new EventBus(),
    onShow = noop,
    errors = {},
    ...rest
  } = options;

  const errorsContext = {
    errors
  };

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
    <ErrorsContext.Provider value={ errorsContext }>
      <EventContext.Provider value={ eventContext }>
        <PropertiesPanelContext.Provider value={ propertiesPanelContext }>
          <DescriptionContext.Provider value={ descriptionContext }>
            <TextArea
              { ...rest }
              element={ element }
              id={ id }
              label={ label }
              description={ description }
              getValue={ getValue }
              setValue={ setValue }
              debounce={ debounce }
              rows={ rows }
              monospace={ monospace } />
          </DescriptionContext.Provider>
        </PropertiesPanelContext.Provider>
      </EventContext.Provider>
    </ErrorsContext.Provider>,
    { container });
}

function isValid(node) {
  return !domClasses(node).has('has-error');
}