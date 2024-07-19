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


  it('should return true when element becomes visible', async function() {

    // given
    const element = global.document.createElement('div');
    container.appendChild(element);
    element.style.display = 'none';

    // when
    const { rerender, result } = renderHook(() => useElementVisible(element));

    // then
    await waitFor(() => {
      rerender();
      expect(result.current).to.be.false;
    });

    // when
    element.style.display = 'block';

    // then
    await waitFor(() => {
      rerender();
      expect(result.current).to.be.true;
    });
  });


  it('should return true when element becomes hidden', async function() {

    // given
    const element = global.document.createElement('div');
    container.appendChild(element);

    // when
    const { rerender, result } = renderHook(() => useElementVisible(element));

    // then
    await waitFor(() => {
      rerender();
      expect(result.current).to.be.true;
    });

    // when
    element.style.display = 'none';

    // then
    await waitFor(() => {
      rerender();
      expect(result.current).to.be.false;
    });
  });
});
