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

import TemplatingEditor from 'src/components/entries/templating/TemplatingEditor';

insertCoreStyles();

describe('<TemplatingEditor>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  it('should focus on container click', async function() {

    // given
    render(<Wrapper />, { container });

    const input = domQuery('.bio-properties-panel-feelers-editor', container);
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

      return <TemplatingEditor ref={ ref } />;
    }

    // when
    render(<FocusComponent />, { container });

    // then
    const editor = domQuery('[role="textbox"]', container);
    expect(document.activeElement).to.equal(editor);
  });


  it('should add gutters', async function() {

    // given
    render(<Wrapper enableGutters={ true } />, { container });

    // then
    const gutters = domQuery('.cm-gutter ', container);
    expect(gutters).to.exist;
  });


  it('should load value', async function() {

    // given
    render(<Wrapper value={ 'this templating is a {{sentiment}} one' } />, { container });

    // then
    const editor = domQuery('[role="textbox"]', container);
    expect(editor.textContent).to.equal('this templating is a {{sentiment}} one');
  });


  it('should load empty value', async function() {

    // given
    render(<Wrapper value={ '' } />, { container });

    // then
    const editor = domQuery('[role="textbox"]', container);
    expect(editor.textContent).to.equal('');
  });


  it('should render open popup action', async function() {

    // given
    render(<Wrapper value={ '' } />, { container });

    // then
    const openPopup = domQuery('.bio-properties-panel-open-feel-popup', container);
    expect(openPopup).to.exist;
  });


  it('should handle open popup', async function() {

    // given
    const spy = sinon.spy();

    render(<Wrapper value={ '' } onOpenPopup={ spy } />, { container });

    const openPopup = domQuery('.bio-properties-panel-open-feel-popup', container);

    // when
    openPopup.click();

    // then
    expect(spy).to.have.been.called;
  });


  it('should show placeholder while open popup', async function() {

    // given
    const result = render(<Wrapper value={ '' } />, { container });

    // assume
    expect(domQuery('.bio-properties-panel-feelers-editor__popup-placeholder', container)).not.to.exist;

    // when
    result.rerender(<Wrapper value={ '' } popupOpen={ true } />, { container });

    // then
    expect(domQuery('.bio-properties-panel-feelers-editor__popup-placeholder', container)).to.exist;
  });


  it('should call onOpenPopup with feelers type', async function() {

    // given
    const spy = sinon.spy();
    render(<Wrapper onOpenPopup={ spy } />, { container });

    const openPopupButton = domQuery('.bio-properties-panel-open-feel-popup', container);

    // when
    openPopupButton.click();

    // then
    expect(spy).to.have.been.calledWith('feelers');
  });
});


// helpers ////////////////////

function Wrapper(props) {
  const ref = useRef();

  return <TemplatingEditor { ...props } ref={ ref } />;
}
