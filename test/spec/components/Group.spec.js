import { useContext } from 'preact/hooks';

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

import { PropertiesPanelContext } from 'src/context';

insertCoreStyles();

const noop = () => {};


describe('<Group>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
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
      await header.click();

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

  });


  it('should provide onShow through context', async function() {

    // given
    const Entry = () => {
      const { onShow } = useContext(PropertiesPanelContext);

      onShow();
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
    container
  } = options;

  var MockLayout = createLayout();

  return render(
    <MockLayout>
      <Group { ...options } />
    </MockLayout>,
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

function createLayout(props = {}) {
  const {
    layout = {},
    getLayoutForKey = (key, defaultValue) => defaultValue,
    setLayoutForKey = noop
  } = props;

  const context = {
    layout,
    getLayoutForKey,
    setLayoutForKey
  };

  return ({ children }) => <LayoutContext.Provider value={ context }>{children}</LayoutContext.Provider>;
}
