import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery,
  classes as domClasses
} from 'min-dom';

import {
  expectNoViolations,
  insertCoreStyles,
} from 'test/TestHelper';

import ListItem from 'src/components/ListItem';

import TextFieldEntry from 'src/components/entries/TextField';
import SelectEntry from 'src/components/entries/Select';

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


  describe('auto-focus', function() {

    it('should auto-focus input on list item created', function() {

      // given
      const entries = [
        {
          id: 'foo',
          component: <TextFieldEntry debounce={ () => {} } id="foo" getValue={ () => {} } />
        }
      ];

      const result = createListItem({
        autoFocusEntry: 'foo',
        autoOpen: true,
        container: parentContainer,
        entries
      });

      const input = domQuery('#bio-properties-panel-foo', result.container);

      // then
      expect(document.activeElement).to.equal(input);
    });


    it('should auto-focus select on list item created', function() {

      // given
      const entries = [
        {
          id: 'foo',
          component: <SelectEntry id="foo" getOptions={ () => [] } getValue={ () => {} } />
        }
      ];

      const result = createListItem({
        autoFocusEntry: 'foo',
        autoOpen: true,
        container: parentContainer,
        entries
      });

      const select = domQuery('#bio-properties-panel-foo', result.container);

      // then
      expect(document.activeElement).to.equal(select);
    });

  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      const { container: node } = createListItem({
        container: parentContainer
      });

      // then
      await expectNoViolations(node);
    });

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