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
      const Component = (props) => {
        const { id } = props;

        return <div class="bio-properties-panel-entry" data-entry-id={ id }>
          <input id={ `bio-properties-panel-${ id }` } class="bio-properties-panel-input" />
        </div>;
      };

      const entries = [
        {
          id: 'entry-1',
          component: Component
        },
        {
          id: 'entry-2',
          component: Component
        }
      ];

      const result = createListItem({
        autoFocusEntry: 'entry-1',
        autoOpen: true,
        container: parentContainer,
        entries
      });

      const input = domQuery('#bio-properties-panel-entry-1', result.container);

      // then
      expect(document.activeElement).to.equal(input);
    });


    it('should auto-focus select on list item created', function() {

      // given
      const Component = (props) => {
        const { id } = props;

        return <div class="bio-properties-panel-entry" data-entry-id={ id }>
          <select id={ `bio-properties-panel-${ id }` } class="bio-properties-panel-input">
            <option value="option-1">Option 1</option>
          </select>
        </div>;
      };

      const entries = [
        {
          id: 'entry-1',
          component: Component
        },
        {
          id: 'entry-2',
          component: Component
        }
      ];

      const result = createListItem({
        autoFocusEntry: 'entry-1',
        autoOpen: true,
        container: parentContainer,
        entries
      });

      const select = domQuery('#bio-properties-panel-entry-1', result.container);

      // then
      expect(document.activeElement).to.equal(select);
    });

  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

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
    autoFocusEntry,
    autoOpen = false,
    container,
    entries = [],
    id,
    label = 'List item'
  } = options;

  return render(
    <ListItem
      { ...options }
      autoFocusEntry={ autoFocusEntry }
      autoOpen={ autoOpen }
      entries={ entries }
      id={ id }
      label={ label } />,
    {
      container
    }
  );
}