import { expect } from 'chai';

import { spy as sinonSpy } from 'sinon';

import EventBus from 'diagram-js/lib/core/EventBus';

import { useStickyIntersectionObserver } from 'src/hooks';

import { renderHook, waitFor } from '@testing-library/preact';

import TestContainer from 'mocha-test-container-support';
import { EventContext } from '../../../src/context';


const SCROLL_CONTAINER_SELECTOR = 'div.bio-properties-panel-scroll-container';


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
    const observeSpy = sinonSpy();

    mockIntersectionObserver({ observe: observeSpy });

    const scrollContainer = createScrollContainer(container);
    const domObject = createObserved(scrollContainer);

    // when
    const ref = { current: domObject };

    await renderHook(() => {
      useStickyIntersectionObserver(ref, SCROLL_CONTAINER_SELECTOR, () => {});

      return domObject;
    });

    // then
    expect(observeSpy).to.have.been.calledOnce;
  });


  it('should call for each entry', async function() {

    // given
    const callbackSpy = sinonSpy();

    const triggerCallback = mockIntersectionObserver({});

    const scrollContainer = createScrollContainer(container, { withContent: true });
    const domObject = createObserved(scrollContainer);

    // when
    const ref = { current: domObject };

    await renderHook(() => {
      useStickyIntersectionObserver(ref, SCROLL_CONTAINER_SELECTOR, callbackSpy);

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
    const observeSpy = sinonSpy();

    mockIntersectionObserver({ observe: observeSpy });

    // when
    const ref = { current: undefined };

    await renderHook(() => {
      useStickyIntersectionObserver(ref, SCROLL_CONTAINER_SELECTOR, () => {});

      return undefined;
    });

    // then
    expect(observeSpy).to.not.have.been.called;
  });


  it('should not call when scrollContainer is unmounted', async function() {

    // given
    const callbackSpy = sinonSpy();

    const triggerCallback = mockIntersectionObserver({});

    const scrollContainer = createScrollContainer(container, { withContent: true });
    const domObject = createObserved(scrollContainer);

    const ref = { current: domObject };

    await renderHook(() => {
      useStickyIntersectionObserver(ref, SCROLL_CONTAINER_SELECTOR, callbackSpy);

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
    const observeSpy = sinonSpy();

    mockIntersectionObserver({ observe: observeSpy });

    const scrollContainer = createScrollContainer(container);

    // observed element not yet inside its scroll container
    const domObject = document.createElement('div');
    const ref = { current: domObject };

    await renderHook(() => {
      useStickyIntersectionObserver(ref, SCROLL_CONTAINER_SELECTOR, () => {});

      return domObject;
    }, { wrapper: WithEventContext(eventBus) });

    // assume
    expect(observeSpy).not.to.have.been.called;

    // when
    scrollContainer.appendChild(domObject);

    eventBus.fire('propertiesPanel.attach');

    // then
    await waitFor(() => {
      expect(observeSpy).to.have.been.calledOnce;
    });

  });


  it('should unobserve after unmount', async function() {

    // given
    const unobserveSpy = sinonSpy();

    mockIntersectionObserver({ unobserve: unobserveSpy });

    const scrollContainer = createScrollContainer(container);
    const domObject = createObserved(scrollContainer);

    const ref = { current: domObject };

    const { unmount } = await renderHook(() => {
      useStickyIntersectionObserver(ref, SCROLL_CONTAINER_SELECTOR, () => {});

      return domObject;
    });

    // when
    unmount();

    // then
    expect(unobserveSpy).to.have.been.calledOnce;
  });


  it('should unobserve after being detached', async function() {

    // given
    const unobserveSpy = sinonSpy();

    mockIntersectionObserver({ unobserve: unobserveSpy });

    const scrollContainer = createScrollContainer(container);
    const domObject = createObserved(scrollContainer);

    const ref = { current: domObject };

    await renderHook(() => {
      useStickyIntersectionObserver(ref, SCROLL_CONTAINER_SELECTOR, () => {});

      return domObject;
    }, { wrapper: WithEventContext(eventBus) });

    // when
    domObject.remove();
    eventBus.fire('propertiesPanel.detach');

    // then
    await waitFor(() => {
      expect(unobserveSpy).to.have.been.calledOnce;
    });

  });


  it('should resolve scroll container relative to the observed element', async function() {

    // given multiple panels mounted in the same document
    const triggerCallback = mockIntersectionObserver({});

    const scrollContainerOne = createScrollContainer(container);
    const scrollContainerTwo = createScrollContainer(container);

    const groupOne = createObserved(scrollContainerOne);
    const groupTwo = createObserved(scrollContainerTwo);

    const setStickyOne = sinonSpy();
    const setStickyTwo = sinonSpy();

    const refOne = { current: groupOne };
    const refTwo = { current: groupTwo };

    // when
    await renderHook(() => {
      useStickyIntersectionObserver(refOne, SCROLL_CONTAINER_SELECTOR, setStickyOne);

      return groupOne;
    });

    await renderHook(() => {
      useStickyIntersectionObserver(refTwo, SCROLL_CONTAINER_SELECTOR, setStickyTwo);

      return groupTwo;
    });

    // then
    // each observer is scoped to its OWN panel's scroll container,
    // not the first scroll container found in document order
    const observers = triggerCallback.instances;

    expect(observers).to.have.length(2);
    expect(observers[0].root).to.equal(scrollContainerOne);
    expect(observers[1].root).to.equal(scrollContainerTwo);

    expect(observers[0].observed).to.equal(groupOne);
    expect(observers[1].observed).to.equal(groupTwo);
  });


  it('should NOT crash when IntersectionObserver is not available', async function() {

    // given
    global.IntersectionObserver = null;

    const scrollContainer = createScrollContainer(container);
    const domObject = createObserved(scrollContainer);

    const ref = { current: domObject };

    // when
    try {
      await renderHook(() => {
        useStickyIntersectionObserver(ref, SCROLL_CONTAINER_SELECTOR, () => {});

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
 * Create a scroll container inside the given parent.
 *
 * @param {Element} parent
 * @param {Object} [options]
 * @param {boolean} [options.withContent=false] add overflowing content so the
 *   container reports a non-zero `scrollHeight`
 *
 * @return {Element}
 */
function createScrollContainer(parent, options = {}) {
  const { withContent = false } = options;

  const scrollContainer = document.createElement('div');
  scrollContainer.classList.add('bio-properties-panel-scroll-container');
  scrollContainer.style.height = '100px';
  scrollContainer.style.overflow = 'auto';

  if (withContent) {
    const content = document.createElement('div');
    content.style.height = '500px';
    scrollContainer.appendChild(content);
  }

  parent.appendChild(scrollContainer);

  return scrollContainer;
}

/**
 * Create an observed element inside the given scroll container.
 *
 * @param {Element} scrollContainer
 *
 * @return {Element}
 */
function createObserved(scrollContainer) {
  const observed = document.createElement('div');

  scrollContainer.appendChild(observed);

  return observed;
}

/**
 * Overrides the IntersectionObserver global with a mock.
 *
 * @param {Object} props
 * @param {Object} [props.observe]
 * @param {Object} [props.unobserve]
 * @returns {Function} triggers the callback on all created observers; the
 *   created observer instances are exposed via the `instances` property
 */
function mockIntersectionObserver(props) {
  const {
    observe = noop,
    unobserve = noop
  } = props;

  const callbacks = [];
  const instances = [];

  function triggerCallbacks(args) {
    callbacks.forEach(callback => callback(args));
  }

  class MockObserver {
    constructor(callback, options = {}) {
      this.root = options.root;
      this.observed = null;

      callbacks.push(callback);
      instances.push(this);
    }

    observe(element) {
      this.observed = element;

      return observe(element);
    }

    unobserve() {
      return unobserve();
    }

  }

  global.IntersectionObserver = MockObserver;

  triggerCallbacks.instances = instances;

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
