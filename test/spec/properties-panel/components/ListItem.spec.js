import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery,
  classes as domClasses
} from 'min-dom';

import {
  insertCoreStyles,
} from 'test/TestHelper';

import ListItem from 'src/properties-panel/components/ListItem';

insertCoreStyles();


describe('<ListItem>', function() {

  let parentContainer;

  beforeEach(function() {
    parentContainer = TestContainer.get(this);
  });


  it('should render', function() {

    // given
    const { container } = createListItem({ container: parentContainer });

    // then
    expect(domQuery('.bio-properties-panel-list-item', container)).to.exist;
  });


  it('should not open per default', function() {

    // given
    const { container } = createListItem({ container: parentContainer });

    const listItem = domQuery('.bio-properties-panel-list-item', container);

    const collapsibleEntry = domQuery('.bio-properties-panel-collapsible-entry', listItem);

    // then
    expect(domClasses(collapsibleEntry).has('open')).to.be.false;
  });


  it('should open when configured', function() {

    // given
    const result = createListItem({ container: parentContainer, autoOpen: true });

    const listItem = domQuery('.bio-properties-panel-list-item', result.container);

    const collapsibleEntry = domQuery('.bio-properties-panel-collapsible-entry', listItem);

    // then
    expect(domClasses(collapsibleEntry).has('open')).to.be.true;
  });

});


// helpers ////////////////////

function createListItem(options = {}) {
  const {
    id,
    label = 'item',
    entries = [],
    autoOpen = false,
    autoFocusEntry,
    container
  } = options;

  return render(
    <ListItem
      id={ id }
      autoOpen={ autoOpen }
      autoFocusEntry={ autoFocusEntry }
      label={ label }
      entries={ entries } />,
    {
      container
    }
  );
}