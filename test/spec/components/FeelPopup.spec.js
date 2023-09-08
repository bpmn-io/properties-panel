import {
  act,
  fireEvent,
  render,
  waitFor
} from '@testing-library/preact/pure';

import { useContext, useRef } from 'preact/hooks';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery
} from 'min-dom';

import {
  expectNoViolations,
  insertCoreStyles
} from 'test/TestHelper';

import { FeelPopupContext } from 'src/components/entries/FEEL/context';

import FEELPopupRoot from 'src/components/entries/FEEL/FeelPopup';

insertCoreStyles();

const noopElement = {
  id: 'foo',
  type: 'foo'
};


describe('<FeelPopup>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should render children', function() {

    // when
    createFeelPopup({}, container);

    const childComponent = domQuery('.child-component', container);

    // then
    expect(childComponent).to.exist;
  });


  it('should render popup in container', async function() {

    // given
    const parent = document.createElement('div');

    // when
    createFeelPopup({ popupContainer: parent }, container);

    const childComponent = domQuery('.child-component', container);

    const btn = domQuery('button', childComponent);

    // when
    await act(() => {
      btn.click();
    });

    // assume
    expect(domQuery('.bio-properties-panel-feel-editor-container', parent)).to.exist;

    // then
    expect(childComponent).to.exist;
  });


  it('should restore focus on source element', async function() {

    // given
    createFeelPopup({}, container);

    const childComponent = domQuery('.child-component', container);
    const btn = domQuery('button', childComponent);

    await act(() => {
      btn.click();
    });

    const closeBtn = domQuery('.bio-properties-panel-feel-popup__close-btn', document.body);

    // when
    await act(() => {
      closeBtn.click();
    });

    // then
    await waitFor(() => {
      expect(document.activeElement).to.eql(btn);
    });
  });


  it('should close popup on element change', async function() {

    // given
    const result = createFeelPopup({ type: 'feel' }, container);

    const childComponent = domQuery('.child-component', container);
    const btn = domQuery('button', childComponent);

    // when
    await act(() => {
      btn.click();
    });

    // assume
    expect(getFeelEditor(document.body)).to.exist;

    // and when
    await act(() => {
      result.rerender({ element: { id: 'bar', type: 'bar' } });
    });

    // then
    expect(getFeelEditor(document.body)).to.not.exist;
  });


  it('should not bubble keyboard events to parent', async function() {

    // given
    const keyDownSpy = sinon.spy();

    container.addEventListener('keydown', keyDownSpy);

    const result = createFeelPopup({ type: 'feel', popupContainer: container }, container);

    const childComponent = domQuery('.child-component', container);
    const btn = domQuery('button', childComponent);

    await act(() => {
      btn.click();
    });

    const editor = getFeelEditor(result.container);

    // when
    fireEvent.keyDown(domQuery('.cm-content', editor), { key: 'A' });

    // then
    expect(keyDownSpy).to.not.have.been.called;
  });


  describe('<feel>', function() {

    it('should open <feel> editor', async function() {

      // given
      createFeelPopup({ type: 'feel' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      // assume
      expect(getFeelEditor(document.body)).to.not.exist;

      // when
      await act(() => {
        btn.click();
      });

      // then
      expect(getFeelEditor(document.body)).to.exist;
    });


    it('should focus <feel> editor', async function() {

      // given
      createFeelPopup({ type: 'feel' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      // when
      await act(() => {
        btn.click();
      });

      const editor = getFeelEditor(document.body);

      // then
      expect(document.activeElement).to.eql(domQuery('.cm-content', editor));
    });


    it('should autosuggest in <feel> editor', async function() {

      // given
      createFeelPopup({ type: 'feel' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      await act(() => {
        btn.click();
      });

      const editor = getFeelEditor(document.body);

      // assume
      expect(editor).to.exist;

      // when
      fireEvent.keyDown(document.activeElement, { key: ' ', ctrlKey: true });

      // then
      let suggestions;
      await waitFor(() => {
        suggestions = domQuery('.cm-tooltip-autocomplete > ul', editor);
        expect(suggestions).to.exist;
      });
    });


    it('should NOT close <feel> editor on ESC (autosuggest)', async function() {

      // given
      createFeelPopup({ type: 'feel' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      await act(() => {
        btn.click();
      });

      const editor = getFeelEditor(document.body);

      expect(editor).to.exist;

      fireEvent.keyDown(domQuery('.cm-content', editor), { key: ' ', ctrlKey: true });

      // assume
      let suggestions;
      await waitFor(() => {
        suggestions = domQuery('.cm-tooltip-autocomplete > ul', editor);
        expect(suggestions).to.exist;
      });

      // when
      fireEvent.keyDown(domQuery('.cm-content', editor), { key: 'Escape' });

      // then
      expect(getFeelEditor(document.body)).to.exist;
    });


    it('should close <feel> editor on ESC (no autosuggest)', async function() {

      // given
      createFeelPopup({ type: 'feel' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      await act(() => {
        btn.click();
      });

      const editor = getFeelEditor(document.body);

      // when
      fireEvent.keyDown(domQuery('.cm-content', editor), { key: 'Escape' });

      // then
      expect(getFeelEditor(document.body)).to.not.exist;
    });


    it('should close <feel> editor on btn click', async function() {

      // given
      createFeelPopup({ type: 'feel' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      await act(() => {
        btn.click();
      });

      // assume
      expect(getFeelEditor(document.body)).to.exist;

      const closeBtn = domQuery('.bio-properties-panel-feel-popup__close-btn', document.body);

      // when
      await act(() => {
        closeBtn.click();
      });

      // then
      expect(getFeelEditor(document.body)).to.not.exist;
    });

  });


  describe('<feelers>', function() {

    it('should open <feelers> editor', async function() {

      // given
      createFeelPopup({ type: 'feelers' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      // assume
      expect(getFeelersEditor(document.body)).to.not.exist;

      // when
      await act(() => {
        btn.click();
      });

      // then
      expect(getFeelersEditor(document.body)).to.exist;
    });


    it('should focus <feelers> editor', async function() {

      // given
      createFeelPopup({ type: 'feelers' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      // when
      await act(() => {
        btn.click();
      });

      const editor = getFeelersEditor(document.body);

      // then
      expect(document.activeElement).to.eql(domQuery('.cm-content', editor));
    });


    it('should close <feelers> editor on ESC (no autosuggest)', async function() {

      // given
      createFeelPopup({ type: 'feelers' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      await act(() => {
        btn.click();
      });

      const editor = getFeelersEditor(document.body);

      // when
      fireEvent.keyDown(domQuery('.cm-content', editor), { key: 'Escape' });

      // then
      expect(getFeelersEditor(document.body)).to.not.exist;
    });


    it('should close <feelers> editor on btn click', async function() {

      // given
      createFeelPopup({ type: 'feelers' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      await act(() => {
        btn.click();
      });

      // assume
      expect(getFeelersEditor(document.body)).to.exist;

      const closeBtn = domQuery('.bio-properties-panel-feel-popup__close-btn', document.body);

      // when
      await act(() => {
        closeBtn.click();
      });

      // then
      expect(getFeelersEditor(document.body)).to.not.exist;
    });

  });


  describe('a11y', function() {

    it('should have no violations - open feel', async function() {

      // given
      this.timeout(5000);

      createFeelPopup({ type: 'feel' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      // when
      await act(() => {
        btn.click();
      });

      const popup = domQuery('.bio-properties-panel-feel-popup', document.body);

      // then
      // @Note(pinussilvestrus): we ignore this rule until
      // https://github.com/bpmn-io/feel-editor/issues/36 is fixed
      await expectNoViolations(popup, {
        rules: {
          'aria-input-field-name': { enabled: false }
        }
      });
    });


    it('should have no violations - open feelers', async function() {

      // given
      this.timeout(5000);

      createFeelPopup({ type: 'feelers' }, container);

      const childComponent = domQuery('.child-component', container);
      const btn = domQuery('button', childComponent);

      // when
      await act(() => {
        btn.click();
      });

      const popup = domQuery('.bio-properties-panel-feel-popup', document.body);

      // then
      await expectNoViolations(popup);
    });

  });

});


// helper //////////////

function createFeelPopup(props, container) {
  const {
    popupContainer,
    element = noopElement,
    type
  } = props;

  return render(
    <FEELPopupRoot popupContainer={ popupContainer } element={ element }>
      <ChildComponent type={ type } />
    </FEELPopupRoot>,
    { container }
  );
}

function ChildComponent(props) {
  const {
    type = 'feel'
  } = props;

  const {
    open
  } = useContext(FeelPopupContext);

  const btnRef = useRef(null);

  const onClick = () => {
    open('foo', {
      id: 'foo',
      title: 'Foo',
      type,
      value: 'foo'
    }, btnRef.current);
  };

  return <div class="child-component">
    <button ref={ btnRef } onClick={ onClick }>Open popup</button>
  </div>;
}

function getFeelEditor(container) {
  return domQuery('.bio-properties-panel-feel-editor-container', container);
}

function getFeelersEditor(container) {
  return domQuery('.bio-properties-panel-feelers-editor-container', container);
}