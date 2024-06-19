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

      it('should NOT sort initially', async function() {

        // given
        const items = [
          {
            id: 'item-4',
            label: 'Item 4'
          },
          {
            id: 'item-3',
            label: 'Item 3'
          },
          {
            id: 'item-2',
            label: 'Item 2'
          },
          {
            id: 'item-1',
            label: 'Item 1'
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
          'item-4',
          'item-3',
          'item-2',
          'item-1'
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
        } = createListGroup({ container: parentContainer, items });

        const list = domQuery('.bio-properties-panel-list', container);

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
        createListGroup({ element: newElement, items: newItems }, rerender);

        // then
        expect(getListOrdering(list)).to.eql([
          'item-1',
          'item-2',
          'item-3',
          'item-4'
        ]);
      });

      it('should NOT sort when open on adding items', async function() {

        // given
        let items = [
          {
            id: 'item-4',
            label: 'Item D'
          },
          {
            id: 'item-3',
            label: 'Item A'
          }
        ];

        const {
          container,
          rerender
        } = createListGroup({ container: parentContainer, items });

        const header = domQuery('.bio-properties-panel-group-header', container);

        const list = domQuery('.bio-properties-panel-list', container);

        // assume
        // (1) open
        waitFor(async () => {
          await header.click();
        });

        expect(getListOrdering(list)).to.eql([
          'item-4',
          'item-3'
        ]);

        // (1) when
        // add
        items = [
          ...items,
          {
            id: 'item-2',
            label: 'Item B'
          }
        ];

        createListGroup({ items }, rerender);

        // then
        expect(getListOrdering(list)).to.eql([
          'item-4',
          'item-3',
          'item-2'
        ]);

        // (2) when
        // add
        items = [
          ...items,
          {
            id: 'item-1',
            label: 'Item C'
          }
        ];

        createListGroup({ items }, rerender);

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
          'item-4',
          'item-3',
          'item-2',
          'item-1'
        ]);
      });


      it('complex (open -> add -> change -> remove -> close -> open)', async function() {

        // given
        let items = [
          {
            id: 'item-5',
            label: 'Item C'
          },
          {
            id: 'item-4',
            label: 'Item A'
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
          'item-5',
          'item-4'
        ]);

        // (2) add
        items = [
          ...items,
          {
            id: 'item-3',
            label: 'Item B'
          }
        ];

        createListGroup({ items }, rerender);

        expect(getListOrdering(list)).to.eql([
          'item-5',
          'item-4',
          'item-3'
        ]);

        // (3) change
        items[0].label = 'aaa';

        createListGroup({ items }, rerender);

        expect(getListOrdering(list)).to.eql([
          'item-5',
          'item-4',
          'item-3'
        ]);

        // (4) remove
        items.splice(1, 1);

        createListGroup({ items }, rerender);

        expect(getListOrdering(list)).to.eql([
          'item-5',
          'item-3'
        ]);

        // (5) close + open
        waitFor(async () => {
          await header.click();
        });

        waitFor(async () => {
          await header.click();
        });

        expect(getListOrdering(list)).to.eql([
          'item-5',
          'item-3'
        ]);
      });

    });


    describe('insert top vs bottom', function() {

      it('should insert new items to bottom', function() {

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
          'item-1',
          'item-2',
          'item-3',
          'item-4'
        ]);
      });

    });


    describe('open', function() {

      function expectItemOpen(container, item, expected) {
        const itemEl = domQuery(`[data-entry-id="${item.id || item}"]`, container);

        expect(domClasses(itemEl).has('open'), `[data-entry-id="${item.id || item}"] open=${expected}`).to.eql(expected);
      }

      function expectListOpen(container, expected) {
        const list = domQuery('.bio-properties-panel-list', container);

        expect(domClasses(list).has('open'), `.bio-properties-panel-list open=${expected}`).to.eql(expected);
      }

      function triggerAdd(container) {

        const addButton = domQuery('.bio-properties-panel-add-entry', container);

        return act(() => {
          addButton.click();
        });
      }


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

          return <TestGroup items={ testItems } add={ add }></TestGroup>;
        };

        const {
          container
        } = render(<Component />, parentContainer);

        // assume
        expectListOpen(container, false);

        // when
        await triggerAdd(container);

        // then
        expectItemOpen(container, 'item-1', false);
        expectItemOpen(container, 'item-2', true);

        expectListOpen(container, true);
      });


      it('should open on adding new item in the middle', async function() {

        // given
        let initialItems = [
          {
            id: 'item-1',
            label: 'Item 1'
          },
          {
            id: 'item-2',
            label: 'Item 2'
          }
        ];

        let newItems = [
          {
            id: 'item-1',
            label: 'Item 1'
          },
          {
            id: 'item-3',
            label: 'Item 3'
          },
          {
            id: 'item-2',
            label: 'Item 2'
          }
        ];

        const Component = () => {
          const [ testItems, setTestItems ] = useState(initialItems);

          const add = () => {
            setTestItems(newItems);
          };

          return <TestGroup items={ testItems } add={ add }></TestGroup>;
        };

        const {
          container
        } = render(<Component />, { container: parentContainer });

        // assume
        expectListOpen(container, false);

        // when
        await triggerAdd(container);

        // then
        expectListOpen(container, true);

        expectItemOpen(container, 'item-1', false);
        expectItemOpen(container, 'item-3', true);
        expectItemOpen(container, 'item-2', false);
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

  describe('translation', function() {

    const translations = {
      'Create new list item': 'Translated: Create new list item',
      'Create': 'Translated: Create',
      'Toggle section': 'Translated: Toggle section',
      'List contains {numOfItems} items': 'Translated: List contains {numOfItems} items'
    };

    function translate(template, replacements = {}) {

      // Translate
      let transTemplate = translations[template] || template;

      // Replace
      return transTemplate.replace(/{([^}]+)}/g, function(_, key) {
        return key in replacements ? replacements[key] : '{' + key + '}';
      });
    }




    it('should render translated create button title', function() {

      // given
      const { container } = createListGroup({ container: parentContainer, add: noop, translate });

      const addButton = domQuery('.bio-properties-panel-add-entry', container);

      // then
      expect(addButton.title).to.eql('Translated: Create new list item');
    });


    it('should render translated create button label', function() {

      // given
      const { container } = createListGroup({ container: parentContainer, add: noop, translate });

      const addButtonLabel = domQuery('.bio-properties-panel-add-entry-label', container);

      // then
      expect(addButtonLabel.textContent).to.eql('Translated: Create');
    });


    it('should render translated toggle section button title', function() {

      // given
      const items = [ { id: 'item-1', label: 'Item 1' } ];
      const { container } = createListGroup({ container: parentContainer, items, translate });

      const toggleButton = domQuery('.bio-properties-panel-arrow', container);

      // then
      expect(toggleButton.title).to.eql('Translated: Toggle section');
    });


    it('should render translated item count title', function() {

      // given
      const items = [
        { id: 'item-1', label: 'Item 1' },
        { id: 'item-2', label: 'Item 2' }
      ];

      const { container } = createListGroup({ container: parentContainer, items, translate });

      const listBadge = domQuery('.bio-properties-panel-list-badge', container);

      // then
      expect(listBadge.title).to.eql('Translated: List contains 2 items');
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
    shouldOpen,
    tooltip,
    translate
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
          shouldOpen={ shouldOpen }
          tooltip={ tooltip }
          translate={ translate }
        />
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
    shouldOpen,
    container,
    tooltip,
    translate
  } = options;

  return renderFn(
    <TestGroup
      element={ element }
      errors={ errors }
      id={ id }
      label={ label }
      items={ items }
      add={ add }
      shouldOpen={ shouldOpen }
      tooltip={ tooltip }
      translate={ translate } /> ,
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