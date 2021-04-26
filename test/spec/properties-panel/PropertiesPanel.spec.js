import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  insertCoreStyles
} from 'test/TestHelper';

import PropertiesPanel from 'src/properties-panel';

import ListGroup from 'src/properties-panel/components/ListGroup';

import {
  HeaderProvider
} from './mocks';

insertCoreStyles();

const noopElement = {
  id: 'foo',
  type: 'foo'
};

const noop = () => {};


describe('<PropertiesPanel>', function() {

  let container,
      parent;

  beforeEach(function() {
    parent = TestContainer.get(this);

    container = document.createElement('div');

    container.classList.add('properties-container');

    container.style.position = 'absolute';
    container.style.right = '0';

    parent.appendChild(container);
  });


  it('should render (no element)', function() {

    // given
    const result = createPropertiesPanel({ container });

    // then
    expect(domQuery('.bio-properties-panel-placeholder', result.container)).to.exist;
  });


  it('should render', function() {

    // given
    const result = createPropertiesPanel({ container, element: noopElement });

    // then
    expect(domQuery('.bio-properties-panel-header', result.container)).to.exist;
    expect(domQuery('.bio-properties-panel-scroll-container', result.container)).to.exist;
  });


  describe('groups', function() {

    it('should render groups', function() {

      // given
      const groups = [
        {
          id: 'group-1',
          label: 'Group 1',
          entries: []
        },
        {
          id: 'group-2',
          label: 'Group 2',
          entries: []
        },
        {
          id: 'group-3',
          label: 'Group 3',
          entries: []
        }
      ];

      // when
      const result = createPropertiesPanel({ container, element: noopElement, groups });

      // then
      expect(domQueryAll('.bio-properties-panel-group', result.container)).to.have.length(3);
    });


    it('should render entries', function() {

      // given
      const groups = [
        {
          id: 'foo',
          label: 'Group 1',
          entries: [
            {
              id: 'entry-1',
              component: <TestEntryComponent value="one" />
            },
            {
              id: 'entry-2',
              component: <TestEntryComponent value="two" />
            },
            {
              id: 'entry-3',
              component: <TestEntryComponent value="three" />
            }
          ]
        }
      ];

      // when
      const result = createPropertiesPanel({ container, element: noopElement, groups });

      const group = domQuery('[data-group-id="group-foo"]', result.container);

      // then
      expect(group).to.exist;

      expect(domQueryAll('.bio-properties-panel-entry', group)).to.have.length(3);
    });


    it('should render list groups', function() {

      // given
      const groups = [
        {
          id: 'group-1',
          label: 'Group 1',
          component: ListGroup,
          items: [
            {
              id: 'item-1',
              label: 'Item 1',
              entries: [
                {
                  id: 'entry-1',
                  component: <TestEntryComponent value="one" />
                },
                {
                  id: 'entry-2',
                  component: <TestEntryComponent value="two" />
                },
                {
                  id: 'entry-3',
                  component: <TestEntryComponent value="three" />
                }
              ]
            },
            {
              id: 'item-2',
              label: 'Item 2',
              entries: []
            },
            {
              id: 'item-3',
              label: 'Item 3',
              entries: []
            }
          ]
        }
      ];

      // when
      const result = createPropertiesPanel({ container, element: noopElement, groups });

      // then
      expect(domQueryAll('.bio-properties-panel-list', result.container)).to.have.length(1);
      expect(domQueryAll('.bio-properties-panel-list-item', result.container)).to.have.length(3);
    });


    it('should render inside defined group component', function() {

      // given
      const groups = [
        {
          id: 'group-1',
          label: 'Group 1',
          entries: [],
          component: TestGroupComponent
        }
      ];

      // when
      const result = createPropertiesPanel({ container, element: noopElement, groups });

      // then
      expect(domQuery('.foo-group', result.container)).to.exist;
    });

  });


  describe('layout context', function() {

    it('should notify on layout changes', function() {

      // given
      const layoutConfig = {
        width: 300,
        open: true,
        foo: 'bar'
      };

      const layoutChangedSpy = sinon.spy();

      // when
      createPropertiesPanel({
        container,
        element: noopElement,
        layoutConfig,
        layoutChanged: layoutChangedSpy
      });

      // then
      expect(layoutChangedSpy).to.have.been.calledWith(layoutConfig);
    });

  });

});


// helpers /////////////////////////

function createPropertiesPanel(options = {}) {

  const {
    container,
    element,
    headerProvider = HeaderProvider,
    groups = [],
    layoutConfig,
    layoutChanged = noop
  } = options;

  return render(
    <PropertiesPanel
      element={ element }
      headerProvider={ headerProvider }
      groups={ groups }
      layoutConfig={ layoutConfig }
      layoutChanged={ layoutChanged }
    />,
    {
      container
    }
  );
}

function TestEntryComponent(props) {
  const {
    value
  } = props;

  return <div class="bio-properties-panel-entry">
    { value }
  </div>;
}

function TestGroupComponent() {
  return <div class="foo-group">foo</div>;
}