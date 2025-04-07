import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery
} from 'min-dom';

import {
  insertCoreStyles
} from 'test/TestHelper';

import { useEffect, useRef } from 'preact/hooks';
import { fireEvent, waitFor } from '@testing-library/preact';

import FeelComponent from 'src/components/entries/FEEL/FeelEditor';

insertCoreStyles();

describe('<FeelEditor>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  it('should supply variables to editor', async function() {

    // increased timeout for slow Windows CI
    this.timeout(5000);

    // given
    const variables = [
      { name: 'foo' },
    ];

    render(<Wrapper variables={ variables } />, { container });

    // when
    const editor = domQuery('[role="textbox"]', container);
    editor.focus();
    fireEvent.keyDown(document.activeElement, { key: ' ', ctrlKey: true });

    // then
    let suggestions;
    await waitFor(() => {
      suggestions = domQuery('.cm-tooltip-autocomplete > ul', container);
      expect(suggestions).to.exist;
    });

    const variableSuggestion = [ ...suggestions.children ].find(el => {
      return el.textContent === 'foo';
    });

    expect(variableSuggestion).to.exist;
  });


  it('should use correct variables after prop change', async function() {

    // given
    const variables = [
      { name: 'foo' },
    ];

    const newVariables = [
      { name: 'baz' },
    ];

    const component = render(<Wrapper variables={ variables } />, { container });

    // when
    component.rerender(<Wrapper variables={ newVariables } />);

    const editor = domQuery('[role="textbox"]', container);

    editor.focus();
    fireEvent.keyDown(document.activeElement, { key: ' ', ctrlKey: true });

    // then
    let suggestions;
    await waitFor(() => {
      suggestions = domQuery('.cm-tooltip-autocomplete > ul', container);
      expect(suggestions).to.exist;
    });

    const variableSuggestion = [ ...suggestions.children ].find(el => {
      return el.textContent === 'baz';
    });

    expect(variableSuggestion).to.exist;
  });


  it('should focus on container click', async function() {

    // given
    render(<Wrapper />, { container });

    const input = domQuery('.bio-properties-panel-input', container);
    const editor = domQuery('[role="textbox"]', container);

    // when
    input.click();

    // then
    expect(document.activeElement).to.equal(editor);
  });


  it('should focus on external event', async function() {

    // given
    function FocusComponent() {
      const ref = useRef();

      useEffect(() => {
        ref.current.focus();
      }, []);

      return <FeelComponent ref={ ref } />;
    }

    // when
    render(<FocusComponent />, { container });

    // then
    const editor = domQuery('[role="textbox"]', container);
    expect(document.activeElement).to.equal(editor);
  });


  it('should enable gutters', async function() {

    // given
    render(<Wrapper enableGutters={ true } />, { container });

    // then
    const gutters = domQuery('.cm-gutter ', container);
    expect(gutters).to.exist;
  });


  it('should set content attributes', async function() {

    // given
    const contentAttributes = {
      'aria-label': 'foo'
    };

    // when
    render(<Wrapper contentAttributes={ contentAttributes } />, { container });

    // then
    const ariaLabel = domQuery('[aria-label=foo] ', container);
    expect(ariaLabel).to.exist;
  });


  it('should set placeholder', async function() {

    // given
    const placeholder = 'foo';

    // when
    render(<Wrapper placeholder={ placeholder } />, { container });

    // then
    const editor = domQuery('[role="textbox"]', container);

    expect(editor.textContent).to.eql(placeholder);
  });


  it('should update placeholder when changed', async function() {

    // given
    const placeholder = 'foo';
    const component = render(<Wrapper placeholder={ placeholder } />, { container });

    // when
    component.rerender(<Wrapper placeholder="bar" />);

    // then
    const editor = domQuery('[role="textbox"]', container);

    expect(editor.textContent).to.eql('bar');
  });


  it('should call <onOpenPopup> with feel type', async function() {

    // given
    const spy = sinon.spy();
    render(<Wrapper onOpenPopup={ spy } />, { container });

    const openPopupButton = domQuery('.bio-properties-panel-open-feel-popup', container);

    // when
    openPopupButton.click();

    // then
    expect(spy).to.have.been.calledWith('feel');
  });
});


// helpers ////////////////////

function Wrapper(props) {
  const ref = useRef();

  return <FeelComponent { ...props } ref={ ref } />;
}
