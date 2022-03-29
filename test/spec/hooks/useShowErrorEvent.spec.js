import EventBus from 'diagram-js/lib/core/EventBus';

import { act } from 'preact/test-utils';

import { renderHook } from '@testing-library/preact-hooks';

import { EventContext } from 'src/context';

import { useShowErrorEvent } from 'src/hooks';


describe('hooks/useShowErrorEvent', function() {

  let eventBus;

  beforeEach(function() {
    eventBus = new EventBus();
  });


  it('should set temporary error', function() {

    // given
    const show = () => true;

    let temporaryError;

    renderHook(() => {
      temporaryError = useShowErrorEvent(show);
    }, { wrapper: WithEventContext(eventBus) });

    // when
    act(() => eventBus.fire('propertiesPanel.showError', { message: 'foo' }));

    // then
    expect(temporaryError).to.equal('foo');
  });


  it('should not set temporary error (no event bus)', function() {

    // given
    const show = () => true;

    let temporaryError;

    renderHook(() => {
      temporaryError = useShowErrorEvent(show);
    });

    // when
    act(() => eventBus.fire('propertiesPanel.showError', { message: 'foo' }));

    // then
    expect(temporaryError).to.be.null;
  });


  it('should fire propertiesPanel.showEntry', function() {

    // given
    const show = () => true;

    const showEntrySpy = sinon.spy();

    eventBus.on('propertiesPanel.showEntry', showEntrySpy);

    renderHook(() => {
      useShowErrorEvent(show);
    }, { wrapper: WithEventContext(eventBus) });

    // when
    act(() => eventBus.fire('propertiesPanel.showError', { message: 'foo' }));

    // then
    expect(showEntrySpy).to.have.been.calledOnce;
    expect(showEntrySpy).to.have.been.calledWithMatch({ message: 'foo' });
  });


  it('should unset temporary error on propertiesPanel.updated', function() {

    // given
    const show = () => true;

    let temporaryError;

    renderHook(() => {
      temporaryError = useShowErrorEvent(show);
    }, { wrapper: WithEventContext(eventBus) });

    act(() => eventBus.fire('propertiesPanel.showError', { message: 'foo' }));

    expect(temporaryError).to.have.equal('foo');

    // when
    act(() => eventBus.fire('propertiesPanel.updated'));

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
