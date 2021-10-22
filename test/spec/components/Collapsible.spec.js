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
  insertCoreStyles,
} from 'test/TestHelper';

import Collapsible from 'src/components/entries/Collapsible';

insertCoreStyles();


describe('<Collapsible>', function() {

  let parentContainer;

  beforeEach(function() {
    parentContainer = TestContainer.get(this);
  });


  it('should render', function() {

    // given
    const entries = [
      {
        id: 'foo',
        component: <div class="some-entry">bar</div>
      }
    ];

    // when
    const { container } = createCollapsible({ container: parentContainer, entries });

    const entriesNode = domQuery('.bio-properties-panel-collapsible-entry-entries', container);

    // then
    expect(domQuery('.bio-properties-panel-collapsible-entry', container)).to.exist;
    expect(domQuery('.some-entry', entriesNode)).to.exist;
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
    await header.click();

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

});


// helpers ////////////////////

function createCollapsible(options = {}) {
  const {
    id,
    label,
    open,
    entries = [],
    remove,
    container
  } = options;

  return render(
    <Collapsible
      id={ id }
      open={ open }
      label={ label }
      remove={ remove }
      entries={ entries } />,
    {
      container
    }
  );
}