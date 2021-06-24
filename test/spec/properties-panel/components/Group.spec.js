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
  insertCoreStyles
} from 'test/TestHelper';

import Group from 'src/properties-panel/components/Group';

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
        isEdited: (node) => !!node.value,
        entryComponent: <TestEntry id="entry1" />,
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
        isEdited: () => false,
        entryComponent: <TestEntry id="entry1" value="foo" />,
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
        entryComponent: <TestEntry id="entry1" value="foo" />,
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
        isEdited: () => true,
        entryComponent: <TestEntry id="entry1" value="foo" />,
      });

      const result = createGroup({ container, label: 'Group', entries });

      const header = domQuery('.bio-properties-panel-group-header', result.container);

      const title = domQuery('.bio-properties-panel-group-header-title', header);

      // then
      expect(domAttr(title, 'title')).to.eql('Group (edited)');
    });

  });

});


// helpers ////////////////////

function createGroup(options = {}) {
  const {
    id,
    label,
    entries = [],
    container
  } = options;

  return render(
    <Group id={ id } label={ label } entries={ entries } />,
    {
      container
    }
  );
}

function createEntries(overrides = {}) {
  const {
    entries = [],
    isEdited = noop,
    entryComponent
  } = overrides;

  const newEntries = [
    {
      id: 'entry1',
      component: entryComponent,
      isEdited
    },
    {
      id: 'entry2'
    },
    {
      id: 'entry2'
    },
    ...entries
  ];

  return newEntries;
}

function TestEntry(props) {
  const {
    id,
    value
  } = props;

  return <div data-entry-id={ id }>
    <input className="bio-properties-panel-input" value={ value }></input>
  </div>;
}