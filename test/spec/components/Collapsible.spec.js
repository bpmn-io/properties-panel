import { useContext } from 'preact/hooks';

import {
  act,
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery,
  classes as domClasses
} from 'min-dom';

import {
  expectNoViolations,
  insertCoreStyles
} from 'test/TestHelper';

import { PropertiesPanelContext } from 'src/context';

import Collapsible from 'src/components/entries/Collapsible';

insertCoreStyles();

const noop = () => {};


describe('<Collapsible>', function() {

  let parentContainer;

  beforeEach(function() {
    parentContainer = TestContainer.get(this);
  });


  it('should render', function() {

    // given
    const entries = [
      {
        id: 'entry-1',
        component: TestEntry
      }
    ];

    // when
    const { container } = createCollapsible({ container: parentContainer, entries });

    const entriesNode = domQuery('.bio-properties-panel-collapsible-entry-entries', container);

    // then
    expect(domQuery('.bio-properties-panel-collapsible-entry', container)).to.exist;
    expect(domQuery('.bio-properties-panel-entry', entriesNode)).to.exist;
  });


  it('should display placeholder for empty labels', function() {

    // given
    const label = '';

    // when
    const { container } = createCollapsible({ container: parentContainer, label });

    const entry = domQuery('.bio-properties-panel-collapsible-entry', container);

    const headerTitle = domQuery('.bio-properties-panel-collapsible-entry-header-title', entry);

    // then
    expect(headerTitle.innerText).to.equal('<empty>');
  });


  it('should be closed initially', function() {

    // when
    const { container } = createCollapsible({ container: parentContainer });

    const entry = domQuery('.bio-properties-panel-collapsible-entry', container);

    // then
    expect(domClasses(entry).has('open')).to.be.false;
  });


  it('should be open when configured', function() {

    // when
    const { container } = createCollapsible({ container: parentContainer, open: true });

    const entry = domQuery('.bio-properties-panel-collapsible-entry', container);

    // then
    expect(domClasses(entry).has('open')).to.be.true;
  });


  it('should toggle open', async function() {

    // given
    const { container } = createCollapsible({ container: parentContainer });

    const entry = domQuery('.bio-properties-panel-collapsible-entry', container);

    const header = domQuery('.bio-properties-panel-collapsible-entry-header', entry);

    const entries = domQuery('.bio-properties-panel-collapsible-entry-entries', entry);

    // assume
    expect(domClasses(entries).has('open')).to.be.false;

    // when
    await act(() => {
      header.click();
    });

    // then
    expect(domClasses(entries).has('open')).to.be.true;
  });


  it('should provide onShow through context', async function() {

    // given
    const Entry = () => {
      const { onShow } = useContext(PropertiesPanelContext);

      onShow();
    };

    const { container } = createCollapsible({
      container: parentContainer,
      entries: [
        {
          id: 'foo',
          component: Entry
        }
      ]
    });

    const entry = domQuery('.bio-properties-panel-collapsible-entry', container);

    const entries = domQuery('.bio-properties-panel-collapsible-entry-entries', entry);

    // then
    expect(domClasses(entries).has('open')).to.be.true;
  });


  it('should bind remove callback', async function() {

    // given
    const remove = sinon.spy();

    const { container } = createCollapsible({ container: parentContainer, remove });

    const removeEntry = domQuery('.bio-properties-panel-remove-entry', container);

    // when
    await act(() => {
      removeEntry.click();
    });

    // then
    expect(remove).to.have.been.called;
  });


  it('should NOT display remove button when no callback was passed', async function() {

    // when
    const { container } = createCollapsible({ container: parentContainer });

    const removeEntry = domQuery('.bio-properties-panel-remove-entry', container);

    // then
    expect(removeEntry).to.not.exist;
  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

      const { container: node } = createCollapsible({
        container: parentContainer,
        label: 'foo'
      });

      // then
      await expectNoViolations(node);
    });

  });


  describe('translation', function() {

    const translate = (str) => `Translated: ${str}`;

    it('should render translated remove button title', function() {

      // given
      const { container } = createCollapsible({ container: parentContainer, remove: noop, translate });

      const removeEntry = domQuery('.bio-properties-panel-remove-entry', container);

      // then
      expect(removeEntry.title).to.eql('Translated: Delete item');
    });


    it('should render translated placeholder label', function() {

      // given
      const { container } = createCollapsible({ container: parentContainer, label: '', translate });

      const headerTitle = domQuery('.bio-properties-panel-collapsible-entry-header-title', container);

      // then
      expect(headerTitle.innerText).to.eql('Translated: <empty>');
    });


    it('should render translated toggle button title', function() {

      // given
      const { container } = createCollapsible({ container: parentContainer, translate });

      const toggleButton = domQuery('.bio-properties-panel-collapsible-entry-arrow', container);

      // then
      expect(toggleButton.title).to.eql('Translated: Toggle list item');
    });
  });


});


// helpers //////////

function createCollapsible(options = {}) {
  const {
    id,
    label,
    open,
    entries = [],
    remove,
    container,
    translate
  } = options;

  return render(
    <Collapsible
      id={ id }
      open={ open }
      label={ label }
      remove={ remove }
      entries={ entries }
      translate={ translate } />,
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