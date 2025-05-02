import sinon from 'sinon';
import { render, fireEvent, cleanup, waitFor } from '@testing-library/preact/pure';
import { expectNoViolations, insertCoreStyles } from 'test/TestHelper';
import { FeelPopup, FEEL_POPUP_WIDTH, FEEL_POPUP_HEIGHT } from 'src/features/feel-popup/components/FeelPopup';

insertCoreStyles();

describe('<FeelPopup>', function() {
  let container;
  let sourceElement;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
    sourceElement = document.createElement('button');
    document.body.appendChild(sourceElement);
  });

  afterEach(function() {
    cleanup();
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
    if (document.body.contains(sourceElement)) {
      document.body.removeChild(sourceElement);
    }
  });


  it('should render the popup with correct dimensions', function() {

    // given
    const onClose = sinon.spy();

    // when
    const { container: rendered } = render(
      <FeelPopup
        entryId="foo"
        title="Test Title"
        type="feel"
        value="bar"
        onInput={ () => {} }
        onClose={ onClose }
        sourceElement={ sourceElement }
        position={ { x: 10, y: 20 } }
      />, { container }
    );

    // then
    const popup = rendered.querySelector('.bio-properties-panel-feel-popup');
    expect(popup).to.exist;
    expect(popup.style.width).to.equal(`${FEEL_POPUP_WIDTH}px`);
    expect(popup.style.height).to.equal(`${FEEL_POPUP_HEIGHT}px`);
  });


  it('should render links when provided', async function() {

    // given
    const onClose = sinon.spy();
    const links = [
      { href: 'https://foo.com', title: 'Foo' },
      { href: 'https://bar.com', title: 'Bar' }
    ];

    // when
    render(
      <FeelPopup
        entryId="foo"
        title="With Links"
        type="feel"
        value=""
        onInput={ () => {} }
        onClose={ onClose }
        links={ links }
        sourceElement={ sourceElement }
      />, { container }
    );

    // then
    const anchors = container.querySelectorAll('.bio-properties-panel-feel-popup__title-link');
    expect(anchors.length).to.equal(2);
    expect(anchors[0].href).to.equal('https://foo.com/');
    expect(anchors[0].textContent).to.contain('Foo');
    expect(anchors[1].href).to.equal('https://bar.com/');
    expect(anchors[1].textContent).to.contain('Bar');
  });


  it('should open FEEL editor when type is "feel" and focus it', async function() {

    // given
    const onClose = sinon.spy();
    const onInput = sinon.spy();

    // when
    render(
      <FeelPopup
        entryId="foo"
        title="Feel"
        type="feel"
        value="initial"
        onInput={ onInput }
        onClose={ onClose }
        sourceElement={ sourceElement }
      />, { container }
    );

    // then
    const editor = container.querySelector('.bio-properties-panel-feel-editor-container');
    expect(editor).to.exist;

    await waitFor(() => {
      const cm = editor.querySelector('.cm-content');
      expect(document.activeElement).to.equal(cm);
    });
  });


  it('should open FEELERS editor when type is "feelers" and focus it', async function() {

    // given
    const onClose = sinon.spy();
    const onInput = sinon.spy();

    // when
    render(
      <FeelPopup
        entryId="foo"
        title="Feelers"
        type="feelers"
        value="templ"
        onInput={ onInput }
        onClose={ onClose }
        sourceElement={ sourceElement }
      />, { container }
    );

    // then
    const editor = container.querySelector('.bio-properties-panel-feelers-editor-container');
    expect(editor).to.exist;

    await waitFor(() => {
      const cm = editor.querySelector('.cm-content');
      expect(document.activeElement).to.equal(cm);
    });
  });


  it('should call onClose when close button is clicked', async function() {

    // given
    const onClose = sinon.spy();

    // when
    render(
      <FeelPopup
        entryId="foo"
        title="Close Test"
        type="feel"
        value=""
        onInput={ () => {} }
        onClose={ onClose }
        sourceElement={ sourceElement }
      />, { container }
    );

    // and
    const closeBtn = container.querySelector('.bio-properties-panel-popup__close');
    fireEvent.click(closeBtn);

    // then
    expect(onClose).to.have.been.calledOnce;
  });


  it('should call onClose on ESC when no autocomplete open', async function() {

    // given
    const onClose = sinon.spy();

    // when
    render(
      <FeelPopup
        entryId="foo"
        title="EscTest"
        type="feel"
        value=""
        onInput={ () => {} }
        onClose={ onClose }
        sourceElement={ sourceElement }
      />, { container }
    );

    // and
    fireEvent.keyDown(container.querySelector('.bio-properties-panel-feel-popup__body'), { key: 'Escape' });

    // then
    expect(onClose).to.have.been.calledOnce;
  });


  it('should restore focus to sourceElement after closing', async function() {

    // given
    const onClose = () => {
      cleanup();
    };
    sinon.spy(sourceElement, 'focus');

    // when
    render(
      <FeelPopup
        entryId="foo"
        title="FocusTest"
        type="feel"
        value=""
        onInput={ () => {} }
        onClose={ onClose }
        sourceElement={ sourceElement }
      />, { container }
    );

    // and
    const closeBtn = container.querySelector('.bio-properties-panel-popup__close');
    fireEvent.click(closeBtn);

    // then
    await waitFor(() => {
      expect(sourceElement.focus).to.have.been.called;
    });
  });

  describe('accessibility', function() {

    it('should have no violations for FEEL popup', async function() {

      // when
      const { container: rendered } = render(
        <FeelPopup
          entryId="foo"
          title="a11y Feel"
          type="feel"
          value=""
          onInput={ () => {} }
          onClose={ () => {} }
          sourceElement={ sourceElement }
        />, { container }
      );

      // then
      const popup = rendered.querySelector('.bio-properties-panel-feel-popup');
      await expectNoViolations(popup, {
        rules: { 'aria-input-field-name': { enabled: false } }
      });
    });


    it('should have no violations for FEELERS popup', async function() {

      // when
      const { container: rendered } = render(
        <FeelPopup
          entryId="foo"
          title="a11y Feelers"
          type="feelers"
          value=""
          onInput={ () => {} }
          onClose={ () => {} }
          sourceElement={ sourceElement }
        />, { container }
      );

      // then
      const popup = rendered.querySelector('.bio-properties-panel-feel-popup');
      await expectNoViolations(popup);
    });
  });
});
