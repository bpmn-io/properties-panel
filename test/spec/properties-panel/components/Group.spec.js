import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery,
  classes as domClasses
} from 'min-dom';

import {
  insertCoreStyles
} from 'test/TestHelper';

import Group from 'src/properties-panel/components/Group';

insertCoreStyles();


describe('<Group>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should render', function() {

    // given
    const result = createGroup({ container });

    // then
    expect(domQuery('.bio-properties-panel-group', result.container)).to.exist;
  });


  it('should toggle open', async function() {

    // given
    const result = createGroup({ container, label: 'Group' });

    const header = domQuery('.bio-properties-panel-group-header', result.container);

    const entries = domQuery('.bio-properties-panel-group-entries', result.container);

    // assume
    expect(domClasses(entries).has('open')).to.be.false;

    // when
    await header.click();

    // then
    expect(domClasses(entries).has('open')).to.be.true;
  });

});


// helpers ////////////////////

function createGroup(options = {}) {
  const {
    id,
    label,
    entries = [],
    container
  } = options;

  return render(
    <Group id={ id } label={ label } entries={ entries } />,
    {
      container
    }
  );
}