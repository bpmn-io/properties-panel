import {
  act,
  render,
  waitFor
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  attr as domAttr,
  query as domQuery,
  queryAll as domQueryAll,
  classes as domClasses
} from 'min-dom';

import {
  insertCoreStyles
} from 'test/TestHelper';

import List from 'src/components/entries/List';

insertCoreStyles();

const noopElement = {
  id: 'foo',
  type: 'foo'
};


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


  describe('auto-focus', function() {

    it('should auto-focus first input entry added', async function() {

      // given
      const renderItem = item => {
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
        renderItem
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
      const input = domQuery('[data-id="item-2"]', container);

      expect(document.activeElement).to.eql(input);
    });


    it('should auto-focus first select on entry added', async function() {

      // given
      const renderItem = item => {
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
        renderItem
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
      const select = domQuery('[data-id="item-2"]', container);

      expect(document.activeElement).to.eql(select);
    });

  });


  describe('ordering', function() {

    it('should create initial ordering from items', function() {

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
          label: 'Item 2'
        }
      ];

      const { container } = createListEntry({ container: parentContainer, items });

      const list = domQuery('.bio-properties-panel-list-entry', container);

      // then
      expect(getListOrdering(list)).to.eql([
        'item-1',
        'item-2',
        'item-3'
      ]);
    });


    it('should re-iniate ordering when element changed (unsorted)', async function() {

      // given
      const items = [
        {
          id: 'item-1',
          label: 'xyz'
        },
        {
          id: 'item-2',
          label: 'ab'
        },
        {
          id: 'item-3',
          label: 'def03'
        }
      ];

      const {
        container,
        rerender
      } = createListEntry({ container: parentContainer, items, compareFn: false });

      const list = domQuery('.bio-properties-panel-list-entry', container);

      // when
      const newElement = {
        ...noopElement,
        id: 'bar'
      };

      // when
      createListEntry({ element: newElement, items, compareFn: false }, rerender);

      // then
      expect(getListOrdering(list)).to.eql([
        'item-1',
        'item-2',
        'item-3'
      ]);
    });


    it('should re-iniate ordering when element changed (sorted)', async function() {

      // given
      const items = [
        {
          id: 'item-1',
          label: 'xyz'
        },
        {
          id: 'item-2',
          label: 'ab'
        },
        {
          id: 'item-3',
          label: 'def03'
        }
      ];

      const {
        container,
        rerender
      } = createListEntry({ container: parentContainer, items });

      const list = domQuery('.bio-properties-panel-list-entry', container);

      // when
      const newElement = {
        ...noopElement,
        id: 'bar'
      };

      // when
      createListEntry({ element: newElement, items }, rerender);

      // then
      expect(getListOrdering(list)).to.eql([
        'item-2',
        'item-3',
        'item-1'
      ]);
    });


    it('should NOT sort if configured', async function() {

      // given
      const items = [
        {
          id: 'item-1',
          label: 'xyz'
        },
        {
          id: 'item-2',
          label: 'ab'
        },
        {
          id: 'item-3',
          label: 'def03'
        },
        {
          id: 'item-4',
          label: 'def04'
        }
      ];

      const { container } = createListEntry({ container: parentContainer, items, compareFn: false });

      const header = domQuery('.bio-properties-panel-list-entry-header', container);

      const list = domQuery('.bio-properties-panel-list-entry', container);

      // when
      waitFor(async () => {
        await header.click();
      });

      // then
      expect(getListOrdering(list)).to.eql([
        'item-1',
        'item-2',
        'item-3',
        'item-4'
      ]);
    });


    it('should order alphanumeric on open (label)', async function() {

      // given
      const items = [
        {
          id: 'item-1',
          label: 'xyz'
        },
        {
          id: 'item-2',
          label: 'ab'
        },
        {
          id: 'item-3',
          label: 'def03'
        },
        {
          id: 'item-4',
          label: 'def04'
        }
      ];

      const { container } = createListEntry({ container: parentContainer, items });

      const header = domQuery('.bio-properties-panel-list-entry-header', container);

      const list = domQuery('.bio-properties-panel-list-entry', container);

      // when
      waitFor(async () => {
        await header.click();
      });

      // then
      expect(getListOrdering(list)).to.eql([
        'item-2',
        'item-3',
        'item-4',
        'item-1'
      ]);
    });


    it('should add new items on top', function() {

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

      const {
        container,
        rerender
      } = createListEntry({ container: parentContainer, items });

      const list = domQuery('.bio-properties-panel-list-entry', container);

      const newItems = [
        ...items,
        {
          id: 'item-4',
          label: 'Item 4'
        }
      ];

      // when
      createListEntry({ items: newItems }, rerender);

      // then
      expect(getListOrdering(list)).to.eql([
        'item-4',
        'item-1',
        'item-2',
        'item-3'
      ]);
    });


    it('should NOT add new items on top - element changed', function() {

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

      const {
        container,
        rerender
      } = createListEntry({ container: parentContainer, items });

      const list = domQuery('.bio-properties-panel-list-entry', container);

      const newItems = [
        ...items,
        {
          id: 'item-4',
          label: 'Item 4'
        }
      ];

      const newElement = {
        ...noopElement,
        id: 'bar'
      };

      // when
      createListEntry({ element: newElement, items: newItems }, rerender);

      // then
      expect(getListOrdering(list)).to.eql([
        'item-1',
        'item-2',
        'item-3',
        'item-4'
      ]);
    });


    it('should sort items - closed + added new one', function() {

      // given
      const items = [
        {
          id: 'item-1',
          label: 'xyz'
        },
        {
          id: 'item-2',
          label: 'ab'
        }
      ];

      const {
        container,
        rerender
      } = createListEntry({ container: parentContainer, label: 'List', items });

      const newItems = [
        ...items,
        {
          id: 'item-3',
          label: 'foo'
        }
      ];

      const list = domQuery('.bio-properties-panel-list-entry', container);

      // assume
      expect(getListOrdering(list)).to.eql([
        'item-2',
        'item-1'
      ]);

      // when
      createListEntry({ items: newItems }, rerender);

      // then
      expect(getListOrdering(list)).to.eql([
        'item-3',
        'item-2',
        'item-1'
      ]);
    });


    it('should keep ordering when items count did not change', async function() {

      // given
      const items = [
        {
          id: 'item-1',
          label: 'xyz'
        },
        {
          id: 'item-2',
          label: 'abc'
        },
        {
          id: 'item-3',
          label: 'foo'
        }
      ];

      const {
        container,
        rerender
      } = createListEntry({ container: parentContainer, items });

      const header = domQuery('.bio-properties-panel-list-entry-header', container);

      const list = domQuery('.bio-properties-panel-list-entry', container);

      waitFor(async () => {
        await header.click();
      });

      // assume
      expect(getListOrdering(list)).to.eql([
        'item-2',
        'item-3',
        'item-1'
      ]);

      items[2].label = 'aaa';

      // when
      createListEntry({ items }, rerender);

      // then
      expect(getListOrdering(list)).to.eql([
        'item-2',
        'item-3',
        'item-1'
      ]);
    });


    it('complex (open -> add -> change -> remove -> close -> open)', async function() {

      // given
      let items = [
        {
          id: 'item-1',
          label: 'xyz'
        },
        {
          id: 'item-2',
          label: 'abc'
        }
      ];

      const {
        container,
        rerender
      } = createListEntry({ container: parentContainer, items });

      const header = domQuery('.bio-properties-panel-list-entry-header', container);

      const list = domQuery('.bio-properties-panel-list-entry', container);

      // when

      // (1) open
      waitFor(async () => {
        await header.click();
      });

      expect(getListOrdering(list)).to.eql([
        'item-2',
        'item-1'
      ]);

      // (2) add
      items = [
        ...items,
        {
          id: 'item-3',
          label: 'foo'
        }
      ];

      createListEntry({ items }, rerender);

      expect(getListOrdering(list)).to.eql([
        'item-3',
        'item-2',
        'item-1'
      ]);

      // (3) change
      items[0].label = 'aaa';

      createListEntry({ items }, rerender);

      expect(getListOrdering(list)).to.eql([
        'item-3',
        'item-2',
        'item-1'
      ]);

      // (4) remove
      items.splice(1, 1);

      createListEntry({ items }, rerender);

      expect(getListOrdering(list)).to.eql([
        'item-3',
        'item-1'
      ]);

      // (5) close + open
      waitFor(async () => {
        await header.click();
      });

      waitFor(async () => {
        await header.click();
      });

      expect(getListOrdering(list)).to.eql([
        'item-1',
        'item-3'
      ]);
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

      const title = domQuery('.bio-properties-panel-list-entry-header-title', header);

      // then
      expect(domAttr(title, 'title')).to.eql('List (2 items)');
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
    renderItem = defaultRenderItem,
    compareFn = defaultCompareFn,
    autoFocusEntry = false
  } = options;

  return renderFn(
    <List
      element={ element }
      id={ id }
      label={ label }
      items={ items }
      onAdd={ onAdd }
      onRemove={ onRemove }
      open={ open }
      renderItem={ renderItem }
      compareFn={ compareFn }
      autoFocusEntry={ autoFocusEntry } />,
    {
      container
    }
  );
}

function defaultRenderItem(item = {}) {
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

function defaultCompareFn(a, b) {
  return a.label === b.label ? 0 : a.label > b.label ? 1 : -1;
}
