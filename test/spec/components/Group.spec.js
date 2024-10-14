import { useContext, useEffect, useState } from 'preact/hooks';

import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  attr as domAttr,
  classes as domClasses,
  query as domQuery
} from 'min-dom';

import {
  expectNoViolations,
  insertCoreStyles
} from 'test/TestHelper';

import {
  LayoutContext
} from 'src/context';

import Group from 'src/components/Group';

import {
  PropertiesPanelContext,
  ErrorsContext
} from 'src/context';
import { fireEvent } from '@testing-library/preact';
import { act } from 'preact/test-utils';

insertCoreStyles();

const noop = () => {};


describe('<Group>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(function() {
    sinon.replace(window, 'requestAnimationFrame', cb => cb());
  });

  afterEach(function() {
    sinon.restore();
  });


  it('should render', function() {

    // given
    const result = createGroup({ container });

    // then
    expect(domQuery('.bio-properties-panel-group', result.container)).to.exist;
  });


  describe('open', function() {

    it('should toggle open', async function() {

      // given
      const result = createGroup({ container, label: 'Group' });

      const header = domQuery('.bio-properties-panel-group-header', result.container);

      const entries = domQuery('.bio-properties-panel-group-entries', result.container);

      // assume
      expect(domClasses(entries).has('open')).to.be.false;

      // when
      await fireEvent.click(header);

      // then
      expect(domClasses(entries).has('open')).to.be.true;
    });


    it('should allow initial configuration', async function() {

      // given
      const result = createGroup({ container, label: 'Group', shouldOpen: true });

      const entries = domQuery('.bio-properties-panel-group-entries', result.container);

      // then
      expect(domClasses(entries).has('open')).to.be.true;
    });


    it('should use global layout', async function() {

      // given
      let setLayoutForKey;
      const Entry = () => {
        setLayoutForKey = useContext(LayoutContext).setLayoutForKey;
      };

      const result = createGroup({
        container,
        id: 'groupId',
        entries: createEntries({
          component: Entry
        }),
        label: 'Group'
      });

      const entries = domQuery('.bio-properties-panel-group-entries', result.container);

      // assume
      expect(domClasses(entries).has('open')).to.be.false;

      // when
      await act(() => setLayoutForKey([ 'groups', 'groupId', 'open' ], true));

      // then
      expect(domClasses(entries).has('open')).to.be.true;

    });

  });


  it('should provide onShow through context', async function() {

    // given
    const Entry = () => {
      const { onShow } = useContext(PropertiesPanelContext);

      useEffect(onShow, []);
    };

    const result = createGroup({
      container,
      entries: createEntries({
        component: Entry
      }),
      label: 'Group'
    });

    const entries = domQuery('.bio-properties-panel-group-entries', result.container);

    // then
    expect(domClasses(entries).has('open')).to.be.true;
  });


  describe('data markers', function() {

    it('should NOT show group as edited - empty entries', function() {

      // given
      const entries = createEntries();

      // when
      const result = createGroup({ container, label: 'Group', entries });

      const header = domQuery('.bio-properties-panel-group-header', result.container);

      const dataMarker = domQuery('.bio-properties-panel-dot', header);

      // then
      expect(dataMarker).not.to.exist;
    });


    it('should NOT show group as edited - empty entry input', function() {

      // given
      const entries = createEntries({
        isEdited: (node) => !!node.value
      });

      // when
      const result = createGroup({ container, label: 'Group', entries });

      const header = domQuery('.bio-properties-panel-group-header', result.container);

      const dataMarker = domQuery('.bio-properties-panel-dot', header);

      // then
      expect(dataMarker).not.to.exist;
    });


    it('should NOT show group as edited - always false', function() {

      // given
      const entries = createEntries({
        isEdited: () => false
      });

      // when
      const result = createGroup({ container, label: 'Group', entries });

      const header = domQuery('.bio-properties-panel-group-header', result.container);

      const dataMarker = domQuery('.bio-properties-panel-dot', header);

      // then
      expect(dataMarker).not.to.exist;
    });


    it('should show group as edited', function() {

      // given
      const entries = createEntries({
        isEdited: (node) => !!node.value,
        value: 'foo'
      });

      // when
      const result = createGroup({ container, label: 'Group', entries });

      const header = domQuery('.bio-properties-panel-group-header', result.container);

      const dataMarker = domQuery('.bio-properties-panel-dot', header);

      // then
      expect(dataMarker).to.exist;
    });


    it('should show error marker', function() {

      // given
      const entries = createEntries();
      const errors = { 'entry-1': 'message' };

      // when
      const result = createGroup({ container, label: 'Group', entries, errors });

      const header = domQuery('.bio-properties-panel-group-header', result.container);

      const errorMarker = domQuery('.bio-properties-panel-dot--error', header);

      // then
      expect(errorMarker).to.exist;
    });

  });


  describe('title attributes', function() {

    it('should have title for empty groups', function() {

      // given
      const result = createGroup({ container, label: 'Group' });

      const header = domQuery('.bio-properties-panel-group-header', result.container);

      const title = domQuery('.bio-properties-panel-group-header-title', header);

      // then
      expect(domAttr(title, 'title')).to.eql('Group');
    });


    it('should not have title for groups with tooltip', function() {

      // given
      const result = createGroup({ container, label: 'Group', tooltip: 'foo' });

      const header = domQuery('.bio-properties-panel-group-header', result.container);

      const title = domQuery('.bio-properties-panel-group-header-title', header);

      // then
      expect(domAttr(title, 'title')).to.not.exist;
    });


    it('should have title for configured groups', function() {

      // given
      const entries = createEntries({
        isEdited: () => true
      });

      const result = createGroup({ container, label: 'Group', entries });

      const header = domQuery('.bio-properties-panel-group-header', result.container);

      const dataMarker = domQuery('.bio-properties-panel-dot', header);

      // then
      expect(domAttr(dataMarker, 'title')).to.eql('Section contains data');
    });

  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

      const { container: node } = createGroup({
        container,
        label: 'foo'
      });

      // then
      await expectNoViolations(node);
    });

  });

});


// helpers ///////////

function createEntries(options = {}) {
  const {
    component = TestEntry,
    isEdited = noop,
    value
  } = options;

  return [
    {
      id: 'entry-1',
      component,
      isEdited,
      value
    },
    {
      id: 'entry-2'
    },
    {
      id: 'entry-3'
    }
  ];
}

function createGroup(options = {}) {
  const {
    container,
    errors = {}
  } = options;


  return render(
    <ErrorsContext.Provider value={ { errors } }>
      <MockLayout>
        <Group id="Example" { ...options } />
      </MockLayout>
    </ErrorsContext.Provider>,
    {
      container
    }
  );
}

function TestEntry(props = {}) {
  const {
    id,
    value
  } = props;

  return <div class="bio-properties-panel-entry" data-entry-id={ id }>
    <input class="bio-properties-panel-input" value={ value } />
  </div>;
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
