import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  insertCoreStyles,
  changeInput
} from 'test/TestHelper';

import Select, { isEdited } from 'src/properties-panel/components/entries/Select';

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
    container
  } = options;

  return render(
    <Select
      element={ element }
      id={ id }
      label={ label }
      description={ description }
      getValue={ getValue }
      setValue={ setValue }
      getOptions={ getOptions } />,
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
      value: 'B'
    },
    {
      label: 'option C',
      value: 'C'
    },
    ...options
  ];

  return newOptions;
}