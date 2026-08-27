import { expect } from 'chai';

import { cleanup, fireEvent, render, waitFor } from '@testing-library/preact/pure';

import { spy as sinonSpy } from 'sinon';

import { FeelPlaygroundPopup } from 'src/features/popup/components/FeelPlaygroundPopup';


describe('<FeelPlaygroundPopup>', function() {
  let container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    cleanup();
    container.remove();
  });


  it('should mount playground content', async function() {

    // when
    render(
      <FeelPlaygroundPopup
        context="{}"
        dialect="expression"
        onClose={ () => {} }
        onInput={ () => {} }
        title="FEEL Playground"
        value="1 + 1"
      />,
      { container }
    );

    // then
    await waitFor(() => {
      expect(container.querySelector('.feel-playground')).to.exist;
    });
  });


  it('should evaluate changed expression', async function() {

    // given
    const onEvaluate = sinonSpy(async () => ({ result: 4 }));
    const onInput = sinonSpy();

    render(
      <FeelPlaygroundPopup
        context="{}"
        dialect="expression"
        onClose={ () => {} }
        onEvaluate={ onEvaluate }
        onInput={ onInput }
        title="FEEL Playground"
        value="1 + 1"
      />,
      { container }
    );

    const editor = container.querySelector('[aria-label="FEEL expression"]');

    // when
    editor.textContent = '2 + 2';
    fireEvent.input(editor);

    // then
    await waitFor(() => {
      expect(onInput).to.have.been.calledWith('2 + 2');
      expect(onEvaluate).to.have.been.calledWithMatch({
        expression: '2 + 2'
      });
    }, { timeout: 2000 });
  });
});