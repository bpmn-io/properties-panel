import EventBus from 'diagram-js/lib/core/EventBus';

import { act } from 'preact/test-utils';

import { renderHook } from '@testing-library/preact-hooks';

import { EventContext } from 'src/context';

import { useShowErrorEvent } from 'src/hooks';

const noop = () => {};


describe('hooks/useShowErrorEvent', function() {

  let eventBus;

  beforeEach(function() {
    eventBus = new EventBus();
  });


  it('should set temporary error', function() {

    // given
    const show = () => true;

    const onShowSpy = sinon.spy();

    let temporaryError;

    renderHook(() => {
      temporaryError = useShowErrorEvent(show, []);
    }, { wrapper: WithEventContext(eventBus, onShowSpy) });

    // when
    act(() => eventBus.fire('propertiesPanel.showError', { message: 'foo' }));

    // then
    expect(temporaryError).to.have.equal('foo');
  });


  it('should fire propertiesPanel.showEntry', function() {

    // given
    const show = () => true;

    const showEntrySpy = sinon.spy();

    eventBus.on('propertiesPanel.showEntry', showEntrySpy);

    renderHook(() => {
      useShowErrorEvent(show, []);
    }, { wrapper: WithEventContext(eventBus, noop) });

    // when
    act(() => eventBus.fire('propertiesPanel.showError', { message: 'foo' }));

    // then
    expect(showEntrySpy).to.have.been.calledOnce;
    expect(showEntrySpy).to.have.been.calledWithMatch({ message: 'foo' });
  });


  it('should unset temporary error on inputs changed', function() {

    // given
    const show = () => true;

    const onShowSpy = sinon.spy();

    let temporaryError;

    const { rerender } = renderHook(({ inputs }) => {
      temporaryError = useShowErrorEvent(show, inputs);
    }, {
      initialProps: {
        inputs: [ 'foo' ]
      },
      wrapper: WithEventContext(eventBus, onShowSpy)
    });

    act(() => eventBus.fire('propertiesPanel.showError', { message: 'foo' }));

    expect(temporaryError).to.have.equal('foo');

    // when
    act(() => rerender({ inputs: [ 'bar' ] }));

    // then
    expect(temporaryError).to.be.null;
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
