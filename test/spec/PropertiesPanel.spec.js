import {
  act,
  render,
  cleanup
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  insertCoreStyles
} from 'test/TestHelper';

import PropertiesPanel from 'src/PropertiesPanel';

import ListGroup from 'src/components/ListGroup';

import {
  HeaderProvider,
  PlaceholderProvider
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


  afterEach(cleanup);

  it('should render (no element)', function() {

    // given
    const result = createPropertiesPanel({ container });

    // then
    const placeholder = domQuery('.bio-properties-panel-placeholder', result.container);
    const placeholderIcon = domQuery('.bio-properties-panel-placeholder', result.container);
    const placeholderText = domQuery('.bio-properties-panel-placeholder-text', placeholder);

    expect(placeholder).to.exist;
    expect(placeholderIcon).to.exist;
    expect(placeholderText.innerText).to.eql('empty');
  });


  it('should render (multiple elements)', function() {

    // given
    const result = createPropertiesPanel({
      container,
      element: [ noopElement, noopElement ]
    });

    // then
    const placeholder = domQuery('.bio-properties-panel-placeholder', result.container);
    const placeholderIcon = domQuery('.bio-properties-panel-placeholder', result.container);
    const placeholderText = domQuery('.bio-properties-panel-placeholder-text', placeholder);

    expect(placeholder).to.exist;
    expect(placeholderIcon).to.exist;
    expect(placeholderText.innerText).to.eql('multiple');
  });


  it('should not throw - no placeholder provider', function() {

    // when
    const result = createPropertiesPanel({
      container,
      placeholderProvider: null
    });

    // then
    const placeholder = domQuery('.bio-properties-panel-placeholder', result.container);

    expect(placeholder).to.not.exist;
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
              component: TestEntry
            },
            {
              id: 'entry-2',
              component: TestEntry
            },
            {
              id: 'entry-3',
              component: TestEntry
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
                  component: TestEntry
                },
                {
                  id: 'entry-2',
                  component: TestEntry
                },
                {
                  id: 'entry-3',
                  component: TestEntry
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
          component: TestGroup
        }
      ];

      // when
      const result = createPropertiesPanel({ container, element: noopElement, groups });

      // then
      expect(domQuery('.foo-group', result.container)).to.exist;
    });

  });


  describe('layout context', function() {

    it('should notify on initial layout loaded', function() {

      // given
      const layoutConfig = {
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
      expect(layoutChangedSpy).to.have.been.calledOnce;
      expect(layoutChangedSpy).to.have.been.calledWith(layoutConfig);
    });


    it('should notify on initial layout loaded (default layout)', async function() {

      // given
      const DEFAULT_LAYOUT = {};
      const layoutChangedSpy = sinon.spy();

      // when
      createPropertiesPanel({
        container,
        element: noopElement,
        layoutChanged: layoutChangedSpy
      });

      // then
      expect(layoutChangedSpy).to.have.been.calledOnce;
      expect(layoutChangedSpy).to.have.been.calledWith(DEFAULT_LAYOUT);
    });


    it('should notify on layout changed', async function() {

      // given
      const groups = [
        {
          id: 'foo',
          entries: []
        }
      ];

      const layoutChangedSpy = sinon.spy();

      // when
      const result = createPropertiesPanel({
        container,
        element: noopElement,
        groups,
        layoutChanged: layoutChangedSpy
      });

      const group = domQuery('[data-group-id="group-foo"]', result.container);
      const header = domQuery('.bio-properties-panel-group-header', group);

      // when
      await act(() => {
        header.click();
      });

      // then
      expect(layoutChangedSpy).to.have.been.calledTwice;
      expect(layoutChangedSpy).to.have.been.calledWith({
        groups: {
          [ groups[0].id ]: { open: true }
        }
      });
    });


    it('should notify on external layout change', async function() {

      // given
      const initialLayoutConfig = {
        open: true,
        foo: 'bar'
      };

      const layoutChangedSpy = sinon.spy();

      const options = {
        container,
        element: noopElement,
        layoutConfig: initialLayoutConfig,
        layoutChanged: layoutChangedSpy,
      };

      const { rerender } = createPropertiesPanel(options);

      // when
      const updatedLayoutConfig = {
        open: false,
        foo: 'baz'
      };

      createPropertiesPanel({
        ...options,
        layoutConfig: updatedLayoutConfig
      }, rerender);

      // then
      expect(layoutChangedSpy).to.have.been.calledWith(updatedLayoutConfig);
    });

  });


  describe('description context', function() {

    it('should notify on description loaded', function() {

      // given
      const descriptionConfig = {
        input1: (element, translate) => undefined
      };

      const descriptionLoadedSpy = sinon.spy();

      // when
      createPropertiesPanel({
        container,
        element: noopElement,
        descriptionConfig,
        descriptionLoaded: descriptionLoadedSpy
      });

      // then
      expect(descriptionLoadedSpy).to.have.been.calledOnce;
      expect(descriptionLoadedSpy).to.have.been.calledWith(descriptionConfig);
    });


    it('should use default config, given no config provided', async function() {

      // given
      const descriptionLoadedSpy = sinon.spy();

      // when
      createPropertiesPanel({
        container,
        element: noopElement,
        descriptionLoaded: descriptionLoadedSpy
      });


      // then
      expect(descriptionLoadedSpy).to.have.been.calledOnce;
      expect(descriptionLoadedSpy).to.have.been.calledWith({});
    });

  });


  describe('tooltip context', function() {

    it('should notify on tooltip loaded', function() {

      // given
      const tooltipConfig = {
        input1: (element, translate) => undefined
      };

      const tooltipLoadedSpy = sinon.spy();

      // when
      createPropertiesPanel({
        container,
        element: noopElement,
        tooltipConfig,
        tooltipLoaded: tooltipLoadedSpy
      });

      // then
      expect(tooltipLoadedSpy).to.have.been.calledOnce;
      expect(tooltipLoadedSpy).to.have.been.calledWith(tooltipConfig);
    });

    it('should use default config, given no config provided', async function() {

      // given
      const tooltipLoadedSpy = sinon.spy();

      // when
      createPropertiesPanel({
        container,
        element: noopElement,
        tooltipLoaded: tooltipLoadedSpy
      });


      // then
      expect(tooltipLoadedSpy).to.have.been.calledOnce;
      expect(tooltipLoadedSpy).to.have.been.calledWith({});
    });

  });

});


// helpers //////////

function createPropertiesPanel(options = {}, renderFn = render) {

  const {
    container,
    element,
    headerProvider = HeaderProvider,
    placeholderProvider = PlaceholderProvider,
    groups = [],
    layoutConfig,
    layoutChanged = noop,
    descriptionConfig,
    descriptionLoaded = noop,
    tooltipConfig,
    tooltipLoaded = noop
  } = options;

  return renderFn(
    <PropertiesPanel
      element={ element }
      headerProvider={ headerProvider }
      placeholderProvider={ placeholderProvider }
      groups={ groups }
      layoutConfig={ layoutConfig }
      layoutChanged={ layoutChanged }
      descriptionConfig={ descriptionConfig }
      descriptionLoaded={ descriptionLoaded }
      tooltipConfig={ tooltipConfig }
      tooltipLoaded={ tooltipLoaded }
    />,
    {
      container
    }
  );
}

function TestEntry(props) {
  const {
    id = 'entry-1',
    value = 'foo'
  } = props;

  return <div class="bio-properties-panel-entry" data-entry-id={ id }>
    <input class="bio-properties-panel-input" value={ value } />
  </div>;
}

function TestGroup() {
  return <div class="foo-group">foo</div>;
}
