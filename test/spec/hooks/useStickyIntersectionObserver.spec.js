import { useStickyIntersectionObserver } from 'src/hooks';

import { renderHook } from '@testing-library/preact-hooks';


describe('hooks/userStickyIntersectionObserver', function() {

  const OriginalIntersectionObserver = global.IntersectionObserver;

  afterEach(function() {
    global.IntersectionObserver = OriginalIntersectionObserver;
  });


  it('should observe', async function() {

    // given
    const observeSpy = sinon.spy();

    mockIntersectionObserver({ observe: observeSpy });

    const domObject = <div></div>;

    // when
    const ref = { current: domObject };

    await renderHook(() => {
      useStickyIntersectionObserver(ref, 'div', () => {});

      return domObject;
    });

    // then
    expect(observeSpy).to.have.been.calledOnce;
  });


  it('should not observe if DOM not ready', async function() {

    // given
    const observeSpy = sinon.spy();

    mockIntersectionObserver({ observe: observeSpy });

    // when
    const ref = { current: undefined };

    await renderHook(() => {
      useStickyIntersectionObserver(ref, 'div', () => {});

      return undefined;
    });

    // then
    expect(observeSpy).to.not.have.been.called;
  });


  it('should unobserve after unmount', async function() {

    // given
    const unobserveSpy = sinon.spy();

    mockIntersectionObserver({ unobserve: unobserveSpy });

    const domObject = <div></div>;

    const ref = { current: domObject };

    const { unmount } = await renderHook(() => {
      useStickyIntersectionObserver(ref, 'div', () => {});

      return domObject;
    });

    // when
    unmount();

    // then
    expect(unobserveSpy).to.have.been.calledOnce;
  });

});


// helpers ////////////////////

function noop() {}

function mockIntersectionObserver(props) {
  const {
    observe = noop,
    unobserve = noop
  } = props;

  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}

    observe() {
      return observe();
    }

    unobserve() {
      return unobserve();
    }

  };
}