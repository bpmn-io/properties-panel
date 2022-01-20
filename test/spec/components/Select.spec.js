import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  expectNoViolations,
  changeInput,
  insertCoreStyles
} from 'test/TestHelper';

import Select, { isEdited } from 'src/components/entries/Select';

import {
  DescriptionContext
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


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
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

function createSelect(options = {}) {
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
    ...rest
  } = options;

  const context = {
    description: descriptionConfig,
    getDescriptionForId
  };

  return render(
    <DescriptionContext.Provider value={ context }>
      <Select
        { ...rest }
        element={ element }
        id={ id }
        label={ label }
        description={ description }
        getValue={ getValue }
        setValue={ setValue }
        getOptions={ getOptions } />
    </DescriptionContext.Provider>,
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
