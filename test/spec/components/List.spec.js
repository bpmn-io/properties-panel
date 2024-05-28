import {
  act,
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  attr as domAttr,
  query as domQuery,
  queryAll as domQueryAll,
  classes as domClasses
} from 'min-dom';

import {
  expectNoViolations,
  insertCoreStyles
} from 'test/TestHelper';

import List from 'src/components/entries/List';

insertCoreStyles();

const noopElement = {
  id: 'foo',
  type: 'foo'
};

const noop = () => {};


describe('<List>', function() {

  let parentContainer;

  beforeEach(function() {
    parentContainer = TestContainer.get(this);
  });


  it('should render', function() {

    // given
    const { container } = createListEntry({ container: parentContainer });

    // then
    expect(domQuery('.bio-properties-panel-list-entry', container)).to.exist;
  });


  it('should render item count', function() {

    // given
    const items = [
      {
        id: 'foo',
        label: 'Item 1'
      },
      {
        id: 'bar',
        label: 'Item 2'
      }
    ];

    const { container } = createListEntry({ container: parentContainer, items });

    const listBadge = domQuery('.bio-properties-panel-list-badge', container);

    // then
    expect(listBadge).to.exist;
    expect(listBadge.innerText).to.eql('2');
  });


  it('should NOT toggle on empty state (no items)', async function() {

    // given
    const { container } = createListEntry({ container: parentContainer });

    const header = domQuery('.bio-properties-panel-list-entry-header', container);

    const list = domQuery('.bio-properties-panel-list-entry', container);

    // assume
    expect(domClasses(list).has('open')).to.be.false;

    // when
    await act(() => {
      header.click();
    });

    // then
    expect(domClasses(list).has('open')).to.be.false;
  });


  it('should toggle open', async function() {

    // given
    const items = [
      {
        id: 'foo',
        label: 'Item 1'
      }
    ];

    const { container } = createListEntry({ container: parentContainer, items });

    const header = domQuery('.bio-properties-panel-list-entry-header', container);

    const list = domQuery('.bio-properties-panel-list-entry', container);

    // assume
    expect(domClasses(list).has('open')).to.be.false;

    // when
    await act(() => {
      header.click();
    });

    // then
    expect(domClasses(list).has('open')).to.be.true;
  });


  it('should open on adding new item', async function() {

    // given
    const items = [
      {
        id: 'item-1',
        label: 'Item 1'
      }
    ];
    const onAdd = () => items.push({
      id: 'item-2',
      label: 'Item 2'
    });

    const {
      container
    } = createListEntry({ container: parentContainer, items, onAdd });

    const list = domQuery('.bio-properties-panel-list-entry', container);

    // assume
    expect(domClasses(list).has('open')).to.be.false;

    // when
    await act(() => {
      domQuery('.bio-properties-panel-add-entry', list).click();
    });

    // then
    expect(domClasses(list).has('open')).to.be.true;
  });


  it('should pass props', async function() {

    // given
    const foo = 'bar';

    const Component = (props) => {

      const { foo } = props;

      expect(foo).to.exist;

      return <span class="foo-entry">{ foo }</span>;
    };

    const items = [
      {
        id: 'item-1',
        label: 'Item 1'
      }
    ];

    const options = {
      container: parentContainer,
      items,
      open: true,
      component: Component,
      foo,
    };

    // when
    const {
      container
    } = createListEntry(options);

    // then
    const node = domQuery('.foo-entry', container);

    expect(node.innerText).to.eql(foo);
  });


  describe('auto-focus', function() {

    it('should auto-focus first input on first entry', async function() {

      // given
      const Component = (props) => {
        const { item } = props;

        return <input class="bio-properties-panel-input" data-id={ item.id } />;
      };

      const items = [
        {
          id: 'item-1',
          label: 'Item 1'
        }
      ];

      const onAdd = () => items.push({
        id: 'item-2',
        label: 'Item 2'
      });

      const options = {
        autoFocusEntry: true,
        container: parentContainer,
        items,
        onAdd,
        open: true,
        component: Component,
      };

      const {
        container,
        rerender
      } = createListEntry(options);

      // when
      await act(() => {
        domQuery('.bio-properties-panel-add-entry', container).click();
      });

      createListEntry(options, rerender);

      // then
      const input = domQuery('[data-id="item-1"]', container);

      expect(document.activeElement).to.eql(input);
    });


    it('should auto-focus first select on first entry', async function() {

      // given
      const Component = (props) => {
        const { item } = props;

        return <select class="bio-properties-panel-input" data-id={ item.id }>
          <option value="foo">Foo</option>
          <option value="bar">Bar</option>
        </select>;
      };

      const items = [
        {
          id: 'item-1',
          label: 'Item 1'
        }
      ];

      const onAdd = () => items.push({
        id: 'item-2',
        label: 'Item 2'
      });

      const options = {
        autoFocusEntry: true,
        container: parentContainer,
        items,
        onAdd,
        open: true,
        component: Component
      };

      const {
        container,
        rerender
      } = createListEntry(options);

      // when
      await act(() => {
        domQuery('.bio-properties-panel-add-entry', container).click();
      });

      createListEntry(options, rerender);

      // then
      const select = domQuery('[data-id="item-1"]', container);

      expect(document.activeElement).to.eql(select);
    });


    it('should focus custom input once new input was added given selector', async function() {

      // given
      const Component = (props) => {
        const { item } = props;

        return <input class="bio-properties-panel-input" data-id={ item.id } />;
      };

      const items = [
        {
          id: 'item-1',
          label: 'Item 1'
        }
      ];

      const onAdd = () => items.push({
        id: 'item-2',
        label: 'Item 2'
      });

      const options = {
        autoFocusEntry: '[data-id="item-1"]',
        container: parentContainer,
        items,
        onAdd,
        open: true,
        component: Component,
      };

      const {
        container,
        rerender
      } = createListEntry(options);

      // when
      await act(() => {
        domQuery('.bio-properties-panel-add-entry', container).click();
      });

      createListEntry(options, rerender);

      // then
      const input = domQuery('[data-id="item-1"]', container);

      expect(document.activeElement).to.eql(input);
    });

    it('should focus new input once input was added given dynamic selector', async function() {

      // given
      const Component = (props) => {
        const { item } = props;

        return <input class="bio-properties-panel-input" data-id={ item.id } />;
      };

      const items = [
        {
          id: 'item-1',
          label: 'Item 1'
        }
      ];

      const onAdd = () => items.push({
        id: 'item-2',
        label: 'Item 2'
      });

      const optionsProvider = () => ({
        autoFocusEntry: `[data-id="item-${items.length}"]`,
        container: parentContainer,
        items,
        onAdd,
        open: true,
        component: Component,
      });

      const {
        container,
        rerender
      } = createListEntry(optionsProvider());

      // when
      await act(() => {
        domQuery('.bio-properties-panel-add-entry', container).click();
      });

      createListEntry(optionsProvider(), rerender);

      // then
      const input = domQuery('[data-id="item-2"]', container);

      expect(document.activeElement).to.eql(input);
    });

  });

  describe('onRemove', function() {

    it('should remove items', async function() {

      // given
      const items = [
        {
          id: 'item-1',
          label: 'Item 1'
        },
        {
          id: 'item-2',
          label: 'Item 2'
        },
        {
          id: 'item-3',
          label: 'Item 3'
        }
      ];

      const onRemove = item => items.splice(items.indexOf(item), 1);

      const {
        container,
        rerender
      } = createListEntry({ container: parentContainer, items, onRemove });

      // when
      await act(() => {
        domQuery('.bio-properties-panel-remove-entry', container).click();
      });
      createListEntry({ items, onRemove }, rerender);

      const list = domQuery('.bio-properties-panel-list-entry', container);

      // then
      expect(getListOrdering(list)).to.eql([
        'item-2',
        'item-3'
      ]);
    });
  });


  describe('title attributes', function() {

    it('should have title for empty lists', function() {

      // given
      const { container } = createListEntry({ container: parentContainer });

      const header = domQuery('.bio-properties-panel-list-entry-header', container);

      const title = domQuery('.bio-properties-panel-list-entry-header-title', header);

      // then
      expect(domAttr(title, 'title')).to.eql('List');
    });


    it('should have title for list with items', function() {

      // given
      const items = [
        {
          id: 'foo',
          label: 'Item 1'
        },
        {
          id: 'bar',
          label: 'Item 2'
        }
      ];

      const { container } = createListEntry({ container: parentContainer, items });

      const header = domQuery('.bio-properties-panel-list-entry-header', container);

      const badge = domQuery('.bio-properties-panel-list-badge', header);

      // then
      expect(domAttr(badge, 'title')).to.eql('List contains 2 items');
    });

  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

      const items = [
        {
          id: 'item-1',
          label: 'Item 1'
        },
        {
          id: 'item-2',
          label: 'Item 2'
        },
        {
          id: 'item-3',
          label: 'Item 3'
        }
      ];

      const { container: node } = createListEntry({
        container: parentContainer,
        items,
        onAdd: noop,
        onRemove: noop
      });

      // then
      await expectNoViolations(node);
    });

  });

});


// helpers ////////////////////

function createListEntry(options = {}, renderFn = render) {
  const {
    element = noopElement,
    id = 'list-id',
    label = 'List',
    items = [],
    onAdd,
    onRemove,
    open,
    container,
    component = DefaultComponent,
    autoFocusEntry = false,
    ...restProps
  } = options;

  return renderFn(
    <List
      { ...restProps }
      element={ element }
      id={ id }
      label={ label }
      items={ items }
      onAdd={ onAdd }
      onRemove={ onRemove }
      open={ open }
      component={ component }
      autoFocusEntry={ autoFocusEntry } />,
    {
      container
    }
  );
}

function DefaultComponent(props) {
  const { item = {} } = props;

  return <span data-entry-id={ item.id }>Item {item.id}</span>;
}

function getListOrdering(list) {
  let ordering = [];

  const items = domQueryAll('.bio-properties-panel-list-entry-item', list);

  items.forEach(item => {
    const collapsible = domQuery('[data-entry-id]', item);

    ordering.push(domAttr(collapsible, 'data-entry-id'));
  });

  return ordering;
}
