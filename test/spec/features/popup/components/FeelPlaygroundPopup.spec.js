import { expect } from 'chai';

import { cleanup, render, waitFor } from '@testing-library/preact/pure';

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
});