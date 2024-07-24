import EventBus from 'diagram-js/lib/core/EventBus';

import { renderHook } from '@testing-library/preact';

import { EventContext } from 'src/context';

import { useEvent } from 'src/hooks';

const noop = () => {};


describe('hooks/useEvent', function() {

  let eventBus;

  beforeEach(function() {
    eventBus = new EventBus();
  });


  it('should subscribe (event bus through context)', function() {

    // given
    const onSpy = sinon.spy(eventBus, 'on');

    // when
    renderHook(() => useEvent('foo', noop), { wrapper: WithEventContext(eventBus) });

    // then
    expect(onSpy).to.have.been.calledOnceWith('foo', noop);
  });


  it('should subscribe (event but through input)', function() {

    // given
    const onSpy = sinon.spy(eventBus, 'on');

    // when
    renderHook(() => useEvent('foo', noop, eventBus));

    // then
    expect(onSpy).to.have.been.calledOnceWith('foo', noop);
  });


  it('should not subscribe (no event bus)', function() {

    // given
    const onSpy = sinon.spy(eventBus, 'on');

    // when
    renderHook(() => useEvent('foo', noop));

    // then
    expect(onSpy).not.to.have.been.called;
  });


  it('should call callback', function() {

    // given
    const onSpy = sinon.spy(eventBus, 'on');

    const callbackSpy = sinon.spy();

    // when
    renderHook(() => useEvent('foo', callbackSpy), { wrapper: WithEventContext(eventBus) });

    const event = { foo: 'bar' };

    eventBus.fire('foo', event);

    // then
    expect(onSpy).to.have.been.calledOnceWith('foo', callbackSpy);

    expect(callbackSpy).to.have.been.calledOnce;
    expect(callbackSpy).to.have.been.always.calledWithMatch(event);
  });


  it('should unsubscribe', function() {

    // given
    const onSpy = sinon.spy(eventBus, 'on');
    const offSpy = sinon.spy(eventBus, 'off');

    const callbackSpy = sinon.spy();

    // when
    const { unmount } = renderHook(() => useEvent('foo', callbackSpy), { wrapper: WithEventContext(eventBus) });

    unmount();

    const event = { foo: 'bar' };

    eventBus.fire('foo', event);

    // then
    expect(onSpy).to.have.been.calledOnceWith('foo', callbackSpy);
    expect(offSpy).to.have.been.calledOnceWith('foo', callbackSpy);

    expect(callbackSpy).not.to.have.been.called;
  });

});


// helpers //////////

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
