import {
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

import ListGroup from 'src/components/ListGroup';

insertCoreStyles();


describe('<ListGroup>', function() {

  let parentContainer;

  beforeEach(function() {
    parentContainer = TestContainer.get(this);
  });


  it('should render', function() {

    // given
    const { container } = createListGroup({ container: parentContainer });

    // then
    expect(domQuery('.bio-properties-panel-group', container)).to.exist;
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

    const { container } = createListGroup({ container: parentContainer, items });

    const listBadge = domQuery('.bio-properties-panel-list-badge', container);

    // then
    expect(listBadge).to.exist;
    expect(listBadge.innerText).to.eql('2');
  });


  it('should NOT toggle on empty state (no items)', async function() {

    // given
    const { container } = createListGroup({ container: parentContainer });

    const header = domQuery('.bio-properties-panel-group-header', container);

    const list = domQuery('.bio-properties-panel-list', container);

    // assume
    expect(domClasses(list).has('open')).to.be.false;

    // when
    await header.click();

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

    const { container } = createListGroup({ container: parentContainer, items });

    const header = domQuery('.bio-properties-panel-group-header', container);

    const list = domQuery('.bio-properties-panel-list', container);

    // assume
    expect(domClasses(list).has('open')).to.be.false;

    // when
    await header.click();

    // then
    expect(domClasses(list).has('open')).to.be.true;
  });


  it('should open on adding new item', function() {

    // given
    const items = [
      {
        id: 'item-1',
        label: 'Item 1'
      }
    ];

    const {
      container,
      rerender
    } = createListGroup({ container: parentContainer, items });

    const list = domQuery('.bio-properties-panel-list', container);

    // assume
    expect(domClasses(list).has('open')).to.be.false;

    const newItems = [
      ...items,
      {
        id: 'item-2',
        label: 'Item 2'
      }
    ];

    // when
    rerender(<ListGroup items={ newItems } />);

    // then
    expect(domClasses(list).has('open')).to.be.true;
  });


  it('should wrap add container', async function() {

    // given
    const spy = sinon.spy();

    const add = ({ children }) => <span class="add" onClick={ spy }>{ children }</span>;

    const { container } = createListGroup({ container: parentContainer, add });

    const addEntry = domQuery('.bio-properties-panel-add-entry', container);

    // when
    await addEntry.parentNode.click();

    // then
    expect(spy).to.have.been.called;
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

      const { container } = createListGroup({ container: parentContainer, items });

      const list = domQuery('.bio-properties-panel-list', container);

      // then
      expect(getListOrdering(list)).to.eql([
        'item-1',
        'item-2',
        'item-3'
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

      const { container } = createListGroup({ container: parentContainer, items });

      const header = domQuery('.bio-properties-panel-group-header', container);

      const list = domQuery('.bio-properties-panel-list', container);

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
      } = createListGroup({ container: parentContainer, items });

      const list = domQuery('.bio-properties-panel-list', container);

      const newItems = [
        ...items,
        {
          id: 'item-4',
          label: 'Item 4'
        }
      ];

      // when
      rerender(<ListGroup items={ newItems } />);

      // then
      expect(getListOrdering(list)).to.eql([
        'item-4',
        'item-1',
        'item-2',
        'item-3'
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
      } = createListGroup({ container: parentContainer, label: 'List', items });

      const newItems = [
        ...items,
        {
          id: 'item-3',
          label: 'foo'
        }
      ];

      const list = domQuery('.bio-properties-panel-list', container);

      // assume
      expect(getListOrdering(list)).to.eql([
        'item-1',
        'item-2'
      ]);

      // when
      rerender(<ListGroup items={ newItems } />);

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
      } = createListGroup({ container: parentContainer, items });

      const header = domQuery('.bio-properties-panel-group-header', container);

      const list = domQuery('.bio-properties-panel-list', container);

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
      rerender(<ListGroup items={ items } />);

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
      } = createListGroup({ container: parentContainer, items });

      const header = domQuery('.bio-properties-panel-group-header', container);

      const list = domQuery('.bio-properties-panel-list', container);

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

      rerender(<ListGroup items={ items } />);

      expect(getListOrdering(list)).to.eql([
        'item-3',
        'item-2',
        'item-1'
      ]);

      // (3) change
      items[0].label = 'aaa';

      rerender(<ListGroup items={ items } />);

      expect(getListOrdering(list)).to.eql([
        'item-3',
        'item-2',
        'item-1'
      ]);

      // (4) remove
      items.splice(1, 1);

      rerender(<ListGroup items={ items } />);

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


  it('should remove items', function() {

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
    } = createListGroup({ container: parentContainer, items });

    items.splice(0, 1);

    // when
    rerender(<ListGroup items={ items } />);

    const list = domQuery('.bio-properties-panel-list', container);

    // then
    expect(getListOrdering(list)).to.eql([
      'item-2',
      'item-3'
    ]);
  });


  describe('title attributes', function() {

    it('should have title for empty lists', function() {

      // given
      const { container } = createListGroup({ container: parentContainer });

      const header = domQuery('.bio-properties-panel-group-header', container);

      const title = domQuery('.bio-properties-panel-group-header-title', header);

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

      const { container } = createListGroup({ container: parentContainer, items });

      const header = domQuery('.bio-properties-panel-group-header', container);

      const title = domQuery('.bio-properties-panel-group-header-title', header);

      // then
      expect(domAttr(title, 'title')).to.eql('List (2 items)');
    });

  });

});


// helpers ////////////////////

function createListGroup(options = {}) {
  const {
    id,
    label = 'List',
    items = [],
    add,
    container
  } = options;

  return render(
    <ListGroup id={ id } label={ label } items={ items } add={ add } />,
    {
      container
    }
  );
}

function getListOrdering(list) {
  let ordering = [];

  const items = domQueryAll('.bio-properties-panel-list-item', list);

  items.forEach(item => {
    const collapsible = domQuery('.bio-properties-panel-collapsible-entry', item);

    ordering.push(domAttr(collapsible, 'data-entry-id'));
  });

  return ordering;
}