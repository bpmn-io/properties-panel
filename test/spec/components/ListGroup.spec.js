import { useContext, useEffect, useState } from 'preact/hooks';

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
  expectNoViolations,
  insertCoreStyles
} from 'test/TestHelper';

import ListGroup from 'src/components/ListGroup';

import { PropertiesPanelContext, LayoutContext } from 'src/context';
import { ErrorsContext } from '../../../src/context';

insertCoreStyles();

const noopElement = {
  id: 'foo',
  type: 'foo'
};

const noop = () => {};


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


  describe('header', function() {

    it('should render item count', function() {

      // given
      const items = [
        {
          id: 'item-1',
          label: 'Item 1'
        },
        {
          id: 'item-2',
          label: 'Item 2'
        }
      ];

      const { container } = createListGroup({ container: parentContainer, items });

      const listBadge = domQuery('.bio-properties-panel-list-badge', container);

      // then
      expect(listBadge).to.exist;
      expect(listBadge.innerText).to.eql('2');
    });


    it('should indicate error', function() {

      // given
      const items = [
        {
          id: 'item-1',
          label: 'Item 1'
        },
        {
          id: 'item-2',
          label: 'Item 2'
        }
      ];

      const errors = {
        'item-1': 'foo'
      };

      const { container } = createListGroup({ container: parentContainer, items, errors });

      const errorBadge = domQuery('.bio-properties-panel-list-badge--error', container);

      // then
      expect(errorBadge).to.exist;
      expect(errorBadge.innerText).to.eql('2');
    });


    it('should indicate error in nested entry', function() {

      // given
      const items = [
        {
          id: 'item-1',
          label: 'Item 1',
          entries: [
            {
              id: 'entry-1'
            }
          ]
        },
        {
          id: 'item-2',
          label: 'Item 2'
        }
      ];

      const errors = {
        'entry-1': 'foo'
      };

      const { container } = createListGroup({ container: parentContainer, items, errors });

      const errorBadge = domQuery('.bio-properties-panel-list-badge--error', container);

      // then
      expect(errorBadge).to.exist;
      expect(errorBadge.innerText).to.eql('2');
    });

  });


  it('should NOT toggle on empty state (no items)', async function() {

    // given
    const { container } = createListGroup({ container: parentContainer });

    const header = domQuery('.bio-properties-panel-group-header', container);

    const list = domQuery('.bio-properties-panel-list', container);

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
        id: 'item-1',
        label: 'Item 1'
      }
    ];

    const { container } = createListGroup({ container: parentContainer, items });

    const header = domQuery('.bio-properties-panel-group-header', container);

    const list = domQuery('.bio-properties-panel-list', container);

    // assume
    expect(domClasses(list).has('open')).to.be.false;

    // when
    await act(() => {
      header.click();
    });

    // then
    expect(domClasses(list).has('open')).to.be.true;
  });


  it('should provide onShow through context', async function() {

    // given
    const Entry = () => {
      const { onShow } = useContext(PropertiesPanelContext);

      useEffect(onShow, []);
    };

    const items = [
      {
        id: 'item-1',
        label: 'Item 1',
        entries: [
          {
            id: 'entry-1',
            component: Entry
          }
        ]
      }
    ];

    const { container } = createListGroup({ container: parentContainer, items });

    const list = domQuery('.bio-properties-panel-list', container);

    // then
    expect(domClasses(list).has('open')).to.be.true;
  });


  it('should bind add callback', async function() {

    // given
    const add = sinon.spy();

    const { container } = createListGroup({ container: parentContainer, add });

    const addEntry = domQuery('.bio-properties-panel-add-entry', container);

    // when
    await act(() => {
      addEntry.click();
    });

    // then
    expect(add).to.have.been.called;
  });


  it('should NOT display add button if no callback was passed', async function() {

    // when
    const { container } = createListGroup({ container: parentContainer });

    const addEntry = domQuery('.bio-properties-panel-add-entry', container);

    // then
    expect(addEntry).to.not.exist;
  });


  describe('behaviors', function() {

    describe('sorting', function() {

      describe('no sort', function() {

        it('should be default', async function() {

          // given
          const items = [
            {
              id: 'item-1',
              label: 'Item D'
            },
            {
              id: 'item-2',
              label: 'Item A'
            },
            {
              id: 'item-3',
              label: 'Item B'
            },
            {
              id: 'item-4',
              label: 'Item C'
            }
          ];

          const { container } = createListGroup({
            container: parentContainer,
            items
          });

          const header = domQuery('.bio-properties-panel-group-header', container);

          const list = domQuery('.bio-properties-panel-list', container);

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


        it('should handle element changed', async function() {

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
          } = createListGroup({
            container: parentContainer,
            items
          });

          const list = domQuery('.bio-properties-panel-list', container);

          // when
          const newElement = {
            ...noopElement,
            id: 'bar'
          };

          // when
          createListGroup({
            element: newElement, items, shouldSort: false }, rerender);

          // then
          expect(getListOrdering(list)).to.eql([
            'item-1',
            'item-2',
            'item-3'
          ]);
        });


        it.only('should NOT sort when open on adding items', async function() {

          // given
          let items = [
            {
              id: 'item-1',
              label: 'Item D'
            },
            {
              id: 'item-2',
              label: 'Item A'
            }
          ];

          const {
            container,
            rerender
          } = createListGroup({
            container: parentContainer,
            items,
            shouldSort: true
          });

          const header = domQuery('.bio-properties-panel-group-header', container);

          const list = domQuery('.bio-properties-panel-list', container);

          // assume
          // (1) open
          waitFor(async () => {
            await header.click();
          });

          expect(getListOrdering(list)).to.eql([
            'item-2',
            'item-1'
          ]);

          // (1) when
          // add
          items = [
            ...items,
            {
              id: 'item-3',
              label: 'Item B'
            }
          ];

          createListGroup({
            items,
            shouldSort: true
          }, rerender);

          // then
          expect(getListOrdering(list)).to.eql([
            'item-3',
            'item-2',
            'item-1'
          ]);

          // (2) when
          // add
          items = [
            ...items,
            {
              id: 'item-4',
              label: 'Item C'
            }
          ];

          createListGroup({
            items,
            shouldSort: true
          }, rerender);

          // then
          expect(getListOrdering(list)).to.eql([
            'item-4',
            'item-3',
            'item-2',
            'item-1'
          ]);


          // (5) when
          // close + open
          waitFor(async () => {
            await header.click();
          });

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

      });


      describe.only('sort (shouldSort = true)', function() {

        it('should sort by label', async function() {

          // given
          const items = [
            {
              id: 'item-3',
              label: 'Item B'
            },
            {
              id: 'item-2',
              label: 'Item A'
            },
            {
              id: 'item-1',
              label: 'Item D'
            },
            {
              id: 'item-4',
              label: 'Item C'
            }
          ];

          const { container } = createListGroup({
            container: parentContainer,
            items,
            shouldSort: true
          });

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


        it('should create from items', function() {

          // given
          const items = [
            {
              id: 'item-1',
              label: 'Item A'
            },
            {
              id: 'item-2',
              label: 'Item B'
            },
            {
              id: 'item-3',
              label: 'Item C'
            }
          ];

          const { container } = createListGroup({
            container: parentContainer,
            items,
            shouldSort: true
          });

          const list = domQuery('.bio-properties-panel-list', container);

          // then
          expect(getListOrdering(list)).to.eql([
            'item-1',
            'item-2',
            'item-3'
          ]);
        });


        it('should re-iniate on element changed', async function() {

          // given
          const items = [
            {
              id: 'item-1',
              label: 'Item C'
            },
            {
              id: 'item-2',
              label: 'Item A'
            },
            {
              id: 'item-3',
              label: 'Item B'
            }
          ];

          const {
            container,
            rerender
          } = createListGroup({
            container: parentContainer,
            items,
            shouldSort: true
          });

          const list = domQuery('.bio-properties-panel-list', container);

          // when
          const newElement = {
            ...noopElement,
            id: 'bar'
          };

          // when
          createListGroup({
            element: newElement,
            items,
            shouldSort: true
          }, rerender);

          // then
          expect(getListOrdering(list)).to.eql([
            'item-2',
            'item-3',
            'item-1'
          ]);
        });


        it('should NOT add new items on top', function() {

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
          } = createListGroup({
            container: parentContainer,
            items,
            shouldSort: true
          });

          const list = domQuery('.bio-properties-panel-list', container);

          const newItems = [
            ...items,
            {
              id: 'item-2-new',
              label: 'Item 2-new'
            }
          ];

          const newElement = {
            ...noopElement,
            id: 'bar'
          };

          // when
          createListGroup({
            element: newElement,
            items: newItems,
            shouldSort: true
          }, rerender);

          // then
          expect(getListOrdering(list)).to.eql([
            'item-1',
            'item-2',
            'item-2-new',
            'item-3'
          ]);

        });


        it('should handle closed + added new one', function() {

          // given
          const items = [
            {
              id: 'item-1',
              label: 'Item C'
            },
            {
              id: 'item-2',
              label: 'Item A'
            }
          ];

          const {
            container,
            rerender
          } = createListGroup({
            container: parentContainer,
            items,
            shouldSort: true
          });

          const newItems = [
            ...items,
            {
              id: 'item-3',
              label: 'Item B'
            }
          ];

          const list = domQuery('.bio-properties-panel-list', container);

          // assume
          expect(getListOrdering(list)).to.eql([
            'item-1',
            'item-2'
          ]);

          // when
          createListGroup({
            items: newItems,
            shouldSort: true
          }, rerender);

          // then
          expect(getListOrdering(list)).to.eql([
            'item-3',
            'item-2',
            'item-1'
          ]);
        });


        it('should keep sorting when items count did not change', async function() {

          // given
          const items = [
            {
              id: 'item-1',
              label: 'Item C'
            },
            {
              id: 'item-2',
              label: 'Item A'
            },
            {
              id: 'item-3',
              label: 'Item B'
            }
          ];

          const {
            container,
            rerender
          } = createListGroup({
            container: parentContainer,
            items,
            shouldSort: true
          });

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
          createListGroup({
            items,
            shouldSort: true
          }, rerender);

          // then
          expect(getListOrdering(list)).to.eql([
            'item-2',
            'item-3',
            'item-1'
          ]);
        });

      });


      it('complex (open -> add -> change -> remove -> close -> open)', async function() {

        // given
        let items = [
          {
            id: 'item-1',
            label: 'Item C'
          },
          {
            id: 'item-2',
            label: 'Item A'
          }
        ];

        const {
          container,
          rerender
        } = createListGroup({
          container: parentContainer,
          items,
          shouldSort: true
        });

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
            label: 'Item B'
          }
        ];

        createListGroup({ items, shouldSort: true }, rerender);

        expect(getListOrdering(list)).to.eql([
          'item-3',
          'item-2',
          'item-1'
        ]);

        // (3) change
        items[0].label = 'aaa';

        createListGroup({ items }, rerender);

        expect(getListOrdering(list)).to.eql([
          'item-3',
          'item-2',
          'item-1'
        ]);

        // (4) remove
        items.splice(1, 1);

        createListGroup({ items }, rerender);

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


    describe('insert top vs bottom', function() {

      it('should insert new items to top given sorting enabled', function() {

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
        createListGroup({ items: newItems }, rerender);

        // then
        expect(getListOrdering(list)).to.eql([
          'item-4',
          'item-1',
          'item-2',
          'item-3'
        ]);
      });


      it('should insert new items to bottom given sorting disabled', function() {

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
        } = createListGroup({ container: parentContainer, items, shouldSort: false });

        const list = domQuery('.bio-properties-panel-list', container);

        const newItems = [
          ...items,
          {
            id: 'item-4',
            label: 'Item 4'
          }
        ];

        // when
        createListGroup({ items: newItems, shouldSort: false }, rerender);

        // then
        expect(getListOrdering(list)).to.eql([
          'item-1',
          'item-2',
          'item-3',
          'item-4'
        ]);
      });

    });


    describe('open', function() {

      it('should open on adding new item per default', async function() {

        // given
        const items = [
          {
            id: 'item-1',
            label: 'Item 1'
          }
        ];

        const newItems = [
          ...items,
          {
            id: 'item-2',
            label: 'Item 2'
          },
        ];

        const Component = () => {
          const [ testItems, setTestItems ] = useState(items);

          const add = () => {
            setTestItems(newItems);
          };

          return <TestGroup items={ testItems } add={ add } shouldSort={ true }></TestGroup>;
        };

        const {
          container
        } = render(<Component />, parentContainer);

        const list = domQuery('.bio-properties-panel-list', container);
        const addButton = domQuery('.bio-properties-panel-add-entry', container);

        // assume
        expect(domClasses(list).has('open')).to.be.false;


        // when
        await act(() => {
          addButton.click();
        });

        // then
        const newItem = domQuery('[data-entry-id="item-2"]', container);
        const oldItem = domQuery('[data-entry-id="item-1"]', container);

        expect(domClasses(newItem).has('open')).to.be.true;
        expect(domClasses(oldItem).has('open')).to.be.false;
        expect(domClasses(list).has('open')).to.be.true;
      });


      it('should open on adding new item per default given no sorting', async function() {

        // given
        const items = [
          {
            id: 'item-1',
            label: 'Item 1'
          }
        ];

        const newItems = [
          ...items,
          {
            id: 'item-2',
            label: 'Item 2'
          }
        ];

        const Component = () => {
          const [ testItems, setTestItems ] = useState(items);

          const add = () => {
            setTestItems(newItems);
          };

          return <TestGroup items={ testItems } add={ add } shouldSort={ false }></TestGroup>;
        };

        const {
          container
        } = render(<Component />, parentContainer);

        const list = domQuery('.bio-properties-panel-list', container);
        const addButton = domQuery('.bio-properties-panel-add-entry', container);

        // assume
        expect(domClasses(list).has('open')).to.be.false;

        // when
        await act(() => {
          addButton.click();
        });

        // then
        const newItem = domQuery('[data-entry-id="item-2"]', container);
        const oldItem = domQuery('[data-entry-id="item-1"]', container);

        expect(domClasses(newItem).has('open')).to.be.true;
        expect(domClasses(oldItem).has('open')).to.be.false;
        expect(domClasses(list).has('open')).to.be.true;
      });


      it('should open on adding new item in the middle', async function() {

        // given
        const newItems = [
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

        const items = [ newItems[0], newItems[2] ];


        const Component = () => {
          const [ testItems, setTestItems ] = useState(items);

          const add = () => {
            setTestItems(newItems);
          };

          return <TestGroup items={ testItems } add={ add } shouldSort={ true }></TestGroup>;
        };

        const {
          container
        } = render(<Component />, parentContainer);

        const list = domQuery('.bio-properties-panel-list', container);
        const addButton = domQuery('.bio-properties-panel-add-entry', container);

        // assume
        expect(domClasses(list).has('open')).to.be.false;

        // when
        await act(() => {
          addButton.click();
        });

        // then
        const newItem = domQuery('[data-entry-id="item-2"]', container);
        const oldItem = domQuery('[data-entry-id="item-1"]', container);
        const otherOldItem = domQuery('[data-entry-id="item-3"]', container);

        expect(domClasses(newItem).has('open')).to.be.true;
        expect(domClasses(oldItem).has('open')).to.be.false;
        expect(domClasses(otherOldItem).has('open')).to.be.false;
        expect(domClasses(list).has('open')).to.be.true;
      });


      it('should NOT open when change was not triggered by clicking add button', function() {

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
        createListGroup({ items: newItems }, rerender);

        // then
        const newItem = domQuery('[data-entry-id="item-2"]', container);
        const oldItem = domQuery('[data-entry-id="item-1"]', container);

        expect(domClasses(newItem).has('open')).to.be.false;
        expect(domClasses(oldItem).has('open')).to.be.false;
        expect(domClasses(list).has('open')).to.be.false;
      });


      it('should NOT open on adding new item given disabled', function() {

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
        createListGroup({ items: newItems, shouldOpen: false }, rerender);

        // then
        expect(domClasses(list).has('open')).to.be.false;
      });

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
    createListGroup({ items }, rerender);

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


    it('should not have title for lists with tooltip', function() {

      // given
      const { container } = createListGroup({ container: parentContainer, tooltip: 'foo' });

      const header = domQuery('.bio-properties-panel-group-header', container);

      const title = domQuery('.bio-properties-panel-group-header-title', header);

      // then
      expect(domAttr(title, 'title')).to.not.exist;
    });


    it('should have title for list with items', function() {

      // given
      const items = [
        {
          id: 'item-1',
          label: 'Item 1'
        },
        {
          id: 'item-2',
          label: 'Item 2'
        }
      ];

      const { container } = createListGroup({ container: parentContainer, items });

      const header = domQuery('.bio-properties-panel-group-header', container);

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
          label: 'Item 1',
          remove: noop
        },
        {
          id: 'item-2',
          label: 'Item 2',
          remove: noop
        },
        {
          id: 'item-3',
          label: 'Item 3',
          remove: noop
        }
      ];

      const add = noop;

      const { container: node } = createListGroup({
        container: parentContainer,
        items,
        add
      });

      // then
      await expectNoViolations(node);
    });

  });

});


// helpers ////////////////////

function TestGroup(props) {
  const {
    element = noopElement,
    errors = {},
    id = 'sampleId',
    label = 'List',
    items = [],
    add,
    shouldSort,
    shouldOpen,
    tooltip
  } = props;

  return (
    <ErrorsContext.Provider value={ { errors } }>
      <MockLayout>
        <ListGroup
          element={ element }
          id={ id }
          label={ label }
          items={ items }
          add={ add }
          shouldSort={ shouldSort }
          shouldOpen={ shouldOpen }
          tooltip={ tooltip } />
      </MockLayout>
    </ErrorsContext.Provider>
  );
}

function createListGroup(options = {}, renderFn = render) {
  const {
    element = noopElement,
    errors,
    id = 'sampleId',
    label = 'List',
    items = [],
    add,
    shouldSort,
    shouldOpen,
    container,
    tooltip
  } = options;

  return renderFn(
    <TestGroup
      element={ element }
      errors={ errors }
      id={ id }
      label={ label }
      items={ items }
      add={ add }
      shouldSort={ shouldSort }
      shouldOpen={ shouldOpen }
      tooltip={ tooltip }
    /> ,
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

function MockLayout({ children }) {
  const [ layout, setLayout ] = useState({});

  const getLayoutForKey = (key, defaultValue) => {
    return layout[key] || defaultValue;
  };

  const setLayoutForKey = (key, value) => {
    setLayout({
      [key]: value
    });
  };

  const context = {
    layout,
    getLayoutForKey,
    setLayoutForKey
  };

  return <LayoutContext.Provider value={ context }>{children}</LayoutContext.Provider>;
}