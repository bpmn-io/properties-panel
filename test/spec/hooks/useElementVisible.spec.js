import { renderHook } from '@testing-library/preact-hooks';

import { waitFor } from '@testing-library/preact';

import { useElementVisible } from 'src/hooks';

import TestContainer from 'mocha-test-container-support';


describe('hooks/useElementVisible', function() {

  let container;
  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should return true for visible element', async function() {

    // given
    const element = global.document.createElement('div');
    element.innerText = 'foo';
    container.appendChild(element);

    // when
    const { rerender, result } = renderHook(() => useElementVisible(element));

    // then
    await waitFor(() => {
      rerender();
      expect(result.current).to.be.true;
    });
  });


  it('should return false for not visible element', async function() {

    // given
    const element = global.document.createElement('div');

    // when
    const { rerender, result } = renderHook(() => useElementVisible(element));

    // then
    await waitFor(() => {
      rerender();
      expect(result.current).to.be.false;
    });
  });


  it('should return false when element does not exist', async function() {

    // given
    const element = undefined;

    // when
    const { rerender, result } = renderHook(() => useElementVisible(element));

    // then
    await waitFor(() => {
      rerender();
      expect(result.current).to.be.false;
    });
  });
});
