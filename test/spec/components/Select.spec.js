import { act } from 'preact/test-utils';

import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  classes as domClasses,
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import EventBus from 'diagram-js/lib/core/EventBus';

import {
  expectNoViolations,
  changeInput,
  insertCoreStyles
} from 'test/TestHelper';

import Select, { isEdited } from 'src/components/entries/Select';

import {
  DescriptionContext,
  ErrorsContext,
  EventContext,
  PropertiesPanelContext
} from 'src/context';

insertCoreStyles();

const noop = () => {};


describe('<Select>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should render', function() {

    // given
    const result = createSelect({ container });

    // then
    expect(domQuery('.bio-properties-panel-select', result.container)).to.exist;
  });


  it('should render options', function() {

    // given
    const getOptions = () => createOptions();

    // when
    const result = createSelect({ container, getOptions });

    const select = domQuery('.bio-properties-panel-select', result.container);

    // then
    expect(domQueryAll('option', select)).to.have.length(4);

  });


  describe('should select', function() {

    const getOptions = () => [
      {
        label: 'A',
        value: 'A'
      },
      {
        label: 'B',
        value: 'B'
      }
    ];


    it('none (undefined value)', function() {

      // when
      const result = createSelect({ container, getOptions, getValue: () => undefined });

      const selectInput = domQuery('.bio-properties-panel-input', result.container);

      // then
      expect(selectInput.value).to.equal('');
    });


    it('active entry', function() {

      // when
      const result = createSelect({ container, getOptions, getValue: () => 'A' });

      const selectInput = domQuery('.bio-properties-panel-input', result.container);

      const optionA = domQuery('option[value="A"]', selectInput);

      // then
      expect(selectInput.value).to.equal('A');
      expect(optionA.selected).to.be.true;
    });

  });


  it('should render disabled', function() {

    // given
    const result = createSelect({ container, disabled: true });

    // then
    expect(
      domQuery('.bio-properties-panel-select select', result.container)
    ).to.have.property('disabled', true);
  });


  it('should update', function() {

    // given
    const getOptions = () => createOptions();

    const updateSpy = sinon.spy();

    const result = createSelect({ container, setValue: updateSpy, getOptions });

    const select = domQuery('.bio-properties-panel-input', result.container);

    // when
    changeInput(select, 'B');

    // then
    expect(updateSpy).to.have.been.calledWith('B');
  });


  it('should use unique input element on element change', function() {

    // given
    const result = createSelect({ element: {}, container });

    const input = domQuery('.bio-properties-panel-input', container);

    // when
    createSelect({ element: {}, container }, result.render);

    // then
    const newInput = domQuery('.bio-properties-panel-input', container);

    expect(newInput).to.not.eql(input);
  });


  describe('options', function() {

    it('should render option enabled per default', function() {

      // given
      const getOptions = () => createOptions();

      // when
      const result = createSelect({ container, getOptions });

      const select = domQuery('.bio-properties-panel-select', result.container);

      // then
      const optionA = domQuery('option[value="A"]', select);

      expect(optionA.disabled).to.be.false;
    });


    it('should render option enabled if set', function() {

      // given
      const getOptions = () => createOptions();

      // when
      const result = createSelect({ container, getOptions });

      const select = domQuery('.bio-properties-panel-select', result.container);

      // then
      const optionB = domQuery('option[value="B"]', select);

      expect(optionB.disabled).to.be.false;
    });


    it('should render option disabled if set', function() {

      // given
      const getOptions = () => createOptions();

      // when
      const result = createSelect({ container, getOptions });

      const select = domQuery('.bio-properties-panel-select', result.container);

      // then
      const optionC = domQuery('option[value="C"]', select);

      expect(optionC.disabled).to.be.true;
    });

  });


  describe('#isEdited', function() {

    it('should NOT be edited', function() {

      // given
      const getOptions = () => createOptions();

      const result = createSelect({ container, getOptions });

      const select = domQuery('.bio-properties-panel-input', result.container);

      // when
      const edited = isEdited(select);

      // then
      expect(edited).to.be.false;
    });


    it('should be edited', function() {

      // given
      const getOptions = () => createOptions();

      const result = createSelect({ container, getOptions, getValue: () => 'B' });

      const select = domQuery('.bio-properties-panel-input', result.container);

      // when
      const edited = isEdited(select);

      // then
      expect(edited).to.be.true;
    });


    it('should be edited after update', function() {

      // given
      const getOptions = () => createOptions();

      const result = createSelect({ container, getOptions });

      const select = domQuery('.bio-properties-panel-input', result.container);

      // assume
      expect(isEdited(select)).to.be.false;

      // when
      changeInput(select, 'B');

      // then
      expect(isEdited(select)).to.be.true;
    });

  });


  describe('events', function() {

    it('should show entry', function() {

      // given
      const eventBus = new EventBus();

      const onShowSpy = sinon.spy();

      createSelect({
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

      const result = createSelect({ container, errors, id: 'foo' });

      // then
      expect(isValid(domQuery('.bio-properties-panel-entry', result.container))).to.be.false;
      expect(domQuery('.bio-properties-panel-error', result.container)).to.exist;
    });

  });


  describe('validation', function() {

    it('should set valid', function() {

      // given
      const validate = () => null;

      const getOptions = () => createOptions();

      const result = createSelect({ container, getOptions, validate });

      const entry = domQuery('.bio-properties-panel-entry', result.container);
      const select = domQuery('.bio-properties-panel-input', entry);


      // when
      changeInput(select, 'A');

      // then
      expect(isValid(entry)).to.be.true;
    });


    it('should set invalid', function() {

      // given
      const validate = () => 'error';

      const getOptions = () => createOptions();

      const result = createSelect({ container, getOptions, validate });

      const entry = domQuery('.bio-properties-panel-entry', result.container);
      const select = domQuery('.bio-properties-panel-input', entry);

      // when
      changeInput(select, 'A');

      // then
      expect(isValid(entry)).to.be.false;
    });


    it('should keep showing invalid value', function() {

      // given
      const validate = () => 'error';

      const getOptions = () => createOptions();

      const result = createSelect({ container, getOptions, validate });

      const entry = domQuery('.bio-properties-panel-entry', result.container);
      const select = domQuery('.bio-properties-panel-input', entry);

      // when
      changeInput(select, 'A');

      // then
      expect(select.value).to.eql('A');
    });


    it('should show error message', function() {

      // given
      const validate = () => 'error';

      const getOptions = () => createOptions();

      const result = createSelect({ container, getOptions, validate });

      const entry = domQuery('.bio-properties-panel-entry', result.container);
      const select = domQuery('.bio-properties-panel-input', entry);

      // when
      changeInput(select, 'A');

      const error = domQuery('.bio-properties-panel-error', entry);

      // then
      expect(error).to.exist;
      expect(error.innerText).to.eql('error');
    });


    it('should pass error to `setValue`', function() {

      // given
      const setValueSpy = sinon.spy();
      const validate = () => 'error';
      const getOptions = () => createOptions();

      const result = createSelect({ container, validate, getOptions, setValue: setValueSpy });

      const entry = domQuery('.bio-properties-panel-entry', result.container);
      const input = domQuery('.bio-properties-panel-input', entry);

      // when
      changeInput(input, 'A');

      // then
      expect(setValueSpy).to.have.been.calledWith('A', 'error');
    });


    it('should check again if validation function changes', function() {

      // given
      let validate = () => 'error';

      const result = createSelect({ container, validate });
      const entry = domQuery('.bio-properties-panel-entry', result.container);

      // assume
      expect(isValid(entry)).to.be.false;

      // when
      validate = () => null;
      createSelect({ container, validate }, result.render);

      // then
      expect(isValid(entry)).to.be.true;
    });

  });


  describe('description', function() {

    it('should render without description per default', function() {

      // given
      const result = createSelect({
        container,
        id: 'noDescriptionSelect'
      });

      // then
      const description = domQuery('[data-entry-id="noDescriptionSelect"] .bio-properties-panel-description',
        result.container);
      expect(description).not.to.exist;
    });


    it('should render with description if set per props', function() {

      // given
      const result = createSelect({
        container,
        id: 'descriptionSelect',
        label: 'someLabel',
        description: 'my description'
      });

      // then
      const description = domQuery('[data-entry-id="descriptionSelect"] .bio-properties-panel-description',
        result.container);

      expect(description).to.exist;
      expect(description.innerText).to.equal('my description');
    });


    it('should render with description if set per context', function() {

      // given
      const descriptionConfig = { descriptionSelect: (element) => 'myContextDesc' };

      const result = createSelect({
        container,
        id: 'descriptionSelect',
        label: 'someLabel',
        descriptionConfig,
        getDescriptionForId: (id, element) => descriptionConfig[id](element)
      });

      // then
      const description = domQuery('[data-entry-id="descriptionSelect"] .bio-properties-panel-description',
        result.container);

      expect(description).to.exist;
      expect(description.innerText).to.equal('myContextDesc');
    });


    it('should render description set per props over context', function() {

      // given
      const descriptionConfig = { descriptionSelect: (element) => 'myContextDesc' };

      const result = createSelect({
        container,
        id: 'descriptionSelect',
        label: 'someLabel',
        description: 'myExplicitDescription',
        descriptionConfig,
        getDescriptionForId: (id, element) => descriptionConfig[id](element)
      });

      // then
      const description = domQuery('[data-entry-id="descriptionSelect"] .bio-properties-panel-description',
        result.container);

      expect(description).to.exist;
      expect(description.innerText).to.equal('myExplicitDescription');
    });

  });


  describe('groups', function() {

    it('should render without children per default', function() {

      // given
      const result = createSelect({
        container,
        id: 'noGroupsSelect'
      });

      // then
      const groups = domQuery('[data-entry-id="noGroupsSelect"] optgroup',
        result.container);
      expect(groups).not.to.exist;
    });


    it('should render with children if set per props', function() {

      // given
      const result = createSelect({
        container,
        id: 'groupsSelect',
        label: 'someLabel',
        getOptions: () => [
          {
            label: 'first group',
            children: [
              {
                label: 'Test option 1',
                value: 'test1'
              },
              {
                label: 'Test option 2',
                value: 'test2',
                disabled: true
              },
            ]
          },
        ]
      });

      // then
      const groups = domQuery(
        '[data-entry-id="groupsSelect"] optgroup',
        result.container
      );

      expect(groups).to.exist;
      expect(groups.label).to.equal('first group');
    });
  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

      const { container: node } = createSelect({
        container,
        label: 'foo'
      });

      // then
      await expectNoViolations(node);
    });

  });

});


// helpers ////////////////////

function createSelect(options = {}, renderFn = render) {
  const {
    element,
    id = 'select',
    description,
    label,
    getValue = noop,
    setValue = noop,
    getOptions = noop,
    descriptionConfig = {},
    getDescriptionForId = noop,
    container,
    eventBus = new EventBus(),
    onShow = noop,
    errors = {},
    validate = noop,
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

  const decriptionContext = {
    description: descriptionConfig,
    getDescriptionForId
  };

  return renderFn(
    <ErrorsContext.Provider value={ errorsContext }>
      <EventContext.Provider value={ eventContext }>
        <PropertiesPanelContext.Provider value={ propertiesPanelContext }>
          <DescriptionContext.Provider value={ decriptionContext }>
            <Select
              { ...rest }
              element={ element }
              id={ id }
              label={ label }
              description={ description }
              getValue={ getValue }
              setValue={ setValue }
              getOptions={ getOptions }
              validate={ validate } />
          </DescriptionContext.Provider>
        </PropertiesPanelContext.Provider>
      </EventContext.Provider>
    </ErrorsContext.Provider>,
    {
      container
    }
  );
}

function createOptions(overrides = {}) {
  const {
    options = []
  } = overrides;

  const newOptions = [
    {
      value: ''
    },
    {
      label: 'option A',
      value: 'A'
    },
    {
      label: 'option B',
      value: 'B',
      disabled: false
    },
    {
      label: 'option C',
      value: 'C',
      disabled: true
    },
    ...options
  ];

  return newOptions;
}

function isValid(node) {
  return !domClasses(node).has('has-error');
}