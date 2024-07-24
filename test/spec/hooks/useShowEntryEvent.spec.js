import EventBus from 'diagram-js/lib/core/EventBus';

import { renderHook } from '@testing-library/preact';

import {
  EventContext,
  PropertiesPanelContext
} from 'src/context';

import { useShowEntryEvent } from 'src/hooks';

const noop = () => {};


describe('hooks/useShowEntryEvent', function() {

  let eventBus;

  beforeEach(function() {
    eventBus = new EventBus();
  });


  it('should call onShow', function() {

    // given
    const onShowSpy = sinon.spy();

    renderHook(() => {
      const ref = useShowEntryEvent('foo');

      return <input id="foo" ref={ ref } />;
    }, { wrapper: WithContext(eventBus, onShowSpy) });

    // when

    eventBus.fire('propertiesPanel.showEntry', { id: 'foo' });

    // then
    expect(onShowSpy).to.have.been.called;
  });


  it('should not call onShow (no event bus)', function() {

    // given
    const onShowSpy = sinon.spy();

    renderHook(() => {
      const ref = useShowEntryEvent('foo');

      return <input id="foo" ref={ ref } />;
    });

    // when
    eventBus.fire('propertiesPanel.showEntry');

    // then
    expect(onShowSpy).not.to.have.been.called;
  });


  it('should call focus', function() {

    // given
    const focusSpy = sinon.spy();

    const { rerender } = renderHook(() => {
      const ref = useShowEntryEvent('foo');

      ref.current = { focus: focusSpy };
    }, { wrapper: WithContext(eventBus, noop) });

    // when
    eventBus.fire('propertiesPanel.showEntry', { id: 'foo' });

    rerender();

    // then
    expect(focusSpy).to.have.been.called;
  });


  it('should call select', function() {

    // given
    const selectSpy = sinon.spy();

    const { rerender } = renderHook(() => {
      const ref = useShowEntryEvent('foo');

      ref.current = { select: selectSpy };
    }, { wrapper: WithContext(eventBus, noop) });

    // when
    eventBus.fire('propertiesPanel.showEntry', { id: 'foo' });

    rerender();

    // then
    expect(selectSpy).to.have.been.called;
  });

});


// helpers //////////

function WithContext(eventBus, onShow = noop) {
  return function Wrapper(props) {
    const { children } = props;

    const propertiesPanelContext = {
      onShow
    };

    const eventContext = {
      eventBus
    };

    return (
      <PropertiesPanelContext.Provider value={ propertiesPanelContext }>
        <EventContext.Provider value={ eventContext }>
          { children }
        </EventContext.Provider>
      </PropertiesPanelContext.Provider>
    );
  };
}
