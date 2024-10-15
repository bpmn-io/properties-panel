import EventBus from 'diagram-js/lib/core/EventBus';

import { useStickyIntersectionObserver } from 'src/hooks';

import { renderHook, waitFor } from '@testing-library/preact';

import TestContainer from 'mocha-test-container-support';
import { EventContext } from '../../../src/context';

describe('hooks/userStickyIntersectionObserver', function() {

  const OriginalIntersectionObserver = global.IntersectionObserver;

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  let eventBus;

  beforeEach(function() {
    eventBus = new EventBus();
  });

  afterEach(function() {
    global.IntersectionObserver = OriginalIntersectionObserver;

    container.remove();
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


  it('should call for each entry', async function() {

    // given
    const callbackSpy = sinon.spy();

    const triggerCallback = mockIntersectionObserver({});

    const domObject = <div></div>;

    // when
    const ref = { current: domObject };

    await renderHook(() => {
      useStickyIntersectionObserver(ref, 'div', callbackSpy);

      return domObject;
    });

    triggerCallback([
      { intersectionRatio: 0 },
      { intersectionRatio: 1 }
    ]);

    // then
    expect(callbackSpy).to.have.been.calledTwice;
    expect(callbackSpy.firstCall).to.have.been.calledWith(true);
    expect(callbackSpy.secondCall).to.have.been.calledWith(false);
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


  it('should not call when scrollContainer is unmounted', async function() {

    // given
    const callbackSpy = sinon.spy();

    const triggerCallback = mockIntersectionObserver({});

    const domObject = <div></div>;

    const scrollContainer = document.createElement('div');
    scrollContainer.setAttribute('id', 'scrollContainer');
    container.appendChild(scrollContainer);

    const ref = { current: domObject };

    await renderHook(() => {
      useStickyIntersectionObserver(ref, '#scrollContainer', callbackSpy);

      return domObject;
    });

    // when
    scrollContainer.remove();
    triggerCallback([
      { intersectionRatio: 1 }
    ]);

    // then
    expect(callbackSpy).not.to.have.been.called;
  });


  it('should observe after being attached', async function() {

    // given
    const observeSpy = sinon.spy();

    mockIntersectionObserver({ observe: observeSpy });

    const domObject = <div></div>;
    const ref = { current: domObject };

    await renderHook(() => {
      useStickyIntersectionObserver(ref, '#scrollContainer', () => {});

      return domObject;
    }, { wrapper: WithEventContext(eventBus) });

    // assume
    expect(observeSpy).not.to.have.been.called;

    // when
    const scrollContainer = document.createElement('div');
    scrollContainer.setAttribute('id', 'scrollContainer');
    container.appendChild(scrollContainer);

    eventBus.fire('propertiesPanel.attach');

    // then
    await waitFor(() => {
      expect(observeSpy).to.have.been.calledOnce;
    });

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


  it('should unobserve after being detached', async function() {

    // given
    const unobserveSpy = sinon.spy();

    mockIntersectionObserver({ unobserve: unobserveSpy });

    const scrollContainer = document.createElement('div');
    scrollContainer.setAttribute('id', 'scrollContainer');
    container.appendChild(scrollContainer);

    const domObject = <div></div>;
    const ref = { current: domObject };

    await renderHook(() => {
      useStickyIntersectionObserver(ref, '#scrollContainer', () => {});

      return domObject;
    }, { wrapper: WithEventContext(eventBus) });

    // when
    scrollContainer.remove();
    eventBus.fire('propertiesPanel.detach');

    // then
    await waitFor(() => {
      expect(unobserveSpy).to.have.been.calledOnce;
    });

  });


  it('should NOT crash when IntersectionObserver is not available', async function() {

    // given
    global.IntersectionObserver = null;

    const domObject = <div></div>;

    const ref = { current: domObject };

    // when
    try {
      await renderHook(() => {
        useStickyIntersectionObserver(ref, 'div', () => {});

        return domObject;
      });
    } catch (error) {

      // then
      expect(error).not.to.exist;
    }
  });
});


// helpers ////////////////////

function noop() {}

/**
 * Overrides the IntersectionObserver global with a mock.
 *
 * @param {Object} props
 * @param {Object} [props.observe]
 * @param {Object} [props.unobserve]
 * @returns {Function} triggers the callback on all created observers
 */
function mockIntersectionObserver(props) {
  const {
    observe = noop,
    unobserve = noop
  } = props;

  const callbacks = [];

  function triggerCallbacks(args) {
    callbacks.forEach(callback => callback(args));
  }

  class MockObserver {
    constructor(callback) {
      callbacks.push(callback);
    }

    observe() {
      return observe();
    }

    unobserve() {
      return unobserve();
    }

  }

  global.IntersectionObserver = MockObserver;

  return triggerCallbacks;
}

function WithEventContext(eventBus) {
  return function Wrapper(props) {
    const { children } = props;

    const eventContext = {
      eventBus
    };

    return (
      <EventContext.Provider value={ eventContext }>
        { children }
      </EventContext.Provider>
    );
  };
}
