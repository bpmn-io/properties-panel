import { expect } from 'chai';

import { spy as sinonSpy } from 'sinon';

import { render, fireEvent, cleanup, waitFor } from '@testing-library/preact/pure';
import { expectNoViolations, insertCoreStyles } from 'test/TestHelper';
import {
  TextPopup,
  TEXT_POPUP_WIDTH,
  TEXT_POPUP_HEIGHT
} from 'src/features/popup/components/TextPopup';

insertCoreStyles();


describe('<TextPopup>', function() {

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

    // when
    const { container: rendered } = render(
      <TextPopup
        entryId="foo"
        title="Test Title"
        value="bar"
        onInput={ () => {} }
        onClose={ () => {} }
        sourceElement={ sourceElement }
      />, { container }
    );

    // then
    const popup = rendered.querySelector('.bio-properties-panel-text-popup');

    expect(popup).to.exist;
    expect(popup.style.width).to.equal(`${TEXT_POPUP_WIDTH}px`);
    expect(popup.style.height).to.equal(`${TEXT_POPUP_HEIGHT}px`);
  });


  it('should render textarea with value', function() {

    // when
    render(
      <TextPopup
        entryId="foo"
        title="Test Title"
        value="bar"
        onInput={ () => {} }
        onClose={ () => {} }
        sourceElement={ sourceElement }
      />, { container }
    );

    // then
    const textarea = container.querySelector('textarea.bio-properties-panel-input');

    expect(textarea).to.exist;
    expect(textarea.value).to.equal('bar');
  });


  it('should focus the textarea on open', async function() {

    // when
    render(
      <TextPopup
        entryId="foo"
        title="Test Title"
        value="bar"
        onInput={ () => {} }
        onClose={ () => {} }
        sourceElement={ sourceElement }
      />, { container }
    );

    // then
    await waitFor(() => {
      const textarea = container.querySelector('textarea.bio-properties-panel-input');
      expect(document.activeElement).to.equal(textarea);
    });
  });


  it('should call onInput on change', function() {

    // given
    const onInput = sinonSpy();

    render(
      <TextPopup
        entryId="foo"
        title="Test Title"
        value=""
        onInput={ onInput }
        onClose={ () => {} }
        sourceElement={ sourceElement }
      />, { container }
    );

    const textarea = container.querySelector('textarea.bio-properties-panel-input');

    // when
    fireEvent.input(textarea, { target: { value: 'changed' } });

    // then
    expect(onInput).to.have.been.calledOnceWith('changed');
  });


  it('should call onClose on close button click', function() {

    // given
    const onClose = sinonSpy();

    render(
      <TextPopup
        entryId="foo"
        title="Test Title"
        value="bar"
        onInput={ () => {} }
        onClose={ onClose }
        sourceElement={ sourceElement }
      />, { container }
    );

    const closeButton = container.querySelector('.bio-properties-panel-popup__close');

    // when
    fireEvent.click(closeButton);

    // then
    expect(onClose).to.have.been.calledOnce;
  });


  describe('a11y', function() {

    it('should have no violations', async function() {

      // given
      this.timeout(5000);

      const { container: node } = render(
        <TextPopup
          entryId="foo"
          title="Test Title"
          value="bar"
          onInput={ () => {} }
          onClose={ () => {} }
          sourceElement={ sourceElement }
        />, { container }
      );

      // then
      await expectNoViolations(node);
    });

  });

});
