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

import ListGroup from 'src/properties-panel/components/ListGroup';

insertCoreStyles();


describe('<ListGroup>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should render', function() {

    // given
    const result = createListGroup({ container });

    // then
    expect(domQuery('.bio-properties-panel-group', result.container)).to.exist;
  });


  it('should toggle open', async function() {

    // given
    const result = createListGroup({ container, label: 'Group' });

    const header = domQuery('.bio-properties-panel-group-header', result.container);

    const list = domQuery('.bio-properties-panel-list', result.container);

    // assume
    expect(domClasses(list).has('open')).to.be.false;

    // when
    await header.click();

    // then
    expect(domClasses(list).has('open')).to.be.true;
  });

});


// helpers ////////////////////

function createListGroup(options = {}) {
  const {
    id,
    label,
    items = [],
    container
  } = options;

  return render(<ListGroup id={ id } label={ label } items={ items } />, container);
}