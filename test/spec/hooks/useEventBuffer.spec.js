import EventBus from 'diagram-js/lib/core/EventBus';

import { renderHook } from '@testing-library/preact-hooks';

import { EventContext } from 'src/context';

import { useEventBuffer } from 'src/hooks';


describe('hooks/useEventBuffer', function() {

  let eventBus;

  beforeEach(function() {
    eventBus = new EventBus();
  });


  it('should buffer event', function() {

    // given
    const fooSpy = sinon.spy();

    // when
    const { rerender } = renderHook(() => useEventBuffer([ 'foo' ], eventBus), { wrapper: WithEventContext(eventBus) });

    eventBus.fire('foo', { value: 'foo' });

    expect(fooSpy).not.to.have.been.called;

    eventBus.on('foo', fooSpy);

    rerender();

    // then
    expect(fooSpy).to.have.been.calledOnce;

    expect(fooSpy.getCall(0).args[ 0 ]).to.include({ value: 'foo' });
  });


  it('should buffer events', function() {

    // given
    const fooSpy = sinon.spy();

    // when
    const { rerender } = renderHook(() => useEventBuffer([ 'foo' ], eventBus), { wrapper: WithEventContext(eventBus) });

    eventBus.fire('foo', { value: 'foo' });
    eventBus.fire('foo', { value: 'bar' });
    eventBus.fire('foo', { value: 'baz' });

    expect(fooSpy).not.to.have.been.called;

    eventBus.on('foo', fooSpy);

    rerender();

    // then
    expect(fooSpy).to.have.been.calledThrice;

    expect(fooSpy.getCall(0).args[ 0 ]).to.include({ value: 'foo' });
    expect(fooSpy.getCall(1).args[ 0 ]).to.include({ value: 'bar' });
    expect(fooSpy.getCall(2).args[ 0 ]).to.include({ value: 'baz' });
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
