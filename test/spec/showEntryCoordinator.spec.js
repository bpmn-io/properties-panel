import { expect } from 'chai';

import { spy as sinonSpy } from 'sinon';

import EventBus from 'diagram-js/lib/core/EventBus';

import {
  render,
  cleanup
} from '@testing-library/preact/pure';

import { act } from 'preact/test-utils';

import TestContainer from 'mocha-test-container-support';

import {
  classes as domClasses,
  query as domQuery
} from 'min-dom';

import {
  insertCoreStyles
} from 'test/TestHelper';

import PropertiesPanel from 'src/PropertiesPanel';

import { useShowEntryEvent } from 'src/hooks';

insertCoreStyles();


// helper: collects focus calls per entry id
function createFocusTracker() {
  return {
    calls: [],
    record(id) {
      this.calls.push(id);
    },
    get lastFocusedId() {
      return this.calls[this.calls.length - 1];
    },
    get focusedIds() {
      return this.calls.slice();
    }
  };
}

function makeFocusableEntry(tracker) {
  return function FocusableEntry(props) {
    const { id } = props;

    const ref = useShowEntryEvent(id);

    // wrap .focus() so we can observe calls without relying on
    // headless browser's document.activeElement behavior
    const setRef = (node) => {
      if (node) {
        const originalFocus = node.focus.bind(node);
        node.focus = function() {
          tracker.record(id);
          return originalFocus();
        };
      }
      ref.current = node;
    };

    return (
      <div class="bio-properties-panel-entry" data-entry-id={ id }>
        <input ref={ setRef } class="bio-properties-panel-input" />
      </div>
    );
  };
}

function NonFocusableEntry(props) {
  const { id } = props;

  return (
    <div class="bio-properties-panel-entry" data-entry-id={ id }>
      <span>{ id }</span>
    </div>
  );
}

const HeaderProvider = {
  getElementLabel: () => 'label',
  getElementIcon: () => null,
  getTypeLabel: () => 'type'
};


describe('showEntry coordinator', function() {

  let parent,
      container,
      eventBus,
      tracker,
      FocusableEntry;

  beforeEach(function() {
    parent = TestContainer.get(this);
    container = document.createElement('div');
    parent.appendChild(container);

    eventBus = new EventBus();

    tracker = createFocusTracker();
    FocusableEntry = makeFocusableEntry(tracker);
  });

  afterEach(cleanup);


  function createPanel(options = {}) {
    const {
      element = { id: 'foo', type: 'foo' },
      groups = [],
      layoutConfig
    } = options;

    return render(
      <PropertiesPanel
        element={ element }
        headerProvider={ HeaderProvider }
        groups={ groups }
        eventBus={ eventBus }
        layoutConfig={ layoutConfig }
      />,
      { container }
    );
  }


  it('should focus entry that is already visible', function() {

    // given
    const groups = [ {
      id: 'g1',
      label: 'Group 1',
      shouldOpen: true,
      entries: [ { id: 'foo', component: FocusableEntry } ]
    } ];

    createPanel({ groups });

    // when
    act(() => eventBus.fire('propertiesPanel.showEntry', { id: 'foo' }));

    // then
    expect(tracker.focusedIds).to.include('foo');
  });


  it('should open collapsed group and focus entry', function() {

    // given (group is closed)
    const groups = [ {
      id: 'g1',
      label: 'Group 1',
      entries: [ { id: 'foo', component: FocusableEntry } ]
    } ];

    createPanel({ groups });

    const groupEntries = domQuery('.bio-properties-panel-group-entries', container);

    // assume
    expect(domClasses(groupEntries).has('open')).to.be.false;

    // when
    act(() => eventBus.fire('propertiesPanel.showEntry', { id: 'foo' }));

    // then
    expect(domClasses(groupEntries).has('open')).to.be.true;
    expect(tracker.focusedIds).to.include('foo');
  });


  it('should focus entry that is mounted only after the event fires', function() {

    // given (initially no groups)
    const { rerender } = createPanel({ groups: [] });

    // when: event fires before the entry's group is rendered
    act(() => eventBus.fire('propertiesPanel.showEntry', { id: 'foo' }));

    // and: groups render later with the target entry (closed group)
    const groups = [ {
      id: 'g1',
      label: 'Group 1',
      entries: [ { id: 'foo', component: FocusableEntry } ]
    } ];

    act(() => {
      rerender(
        <PropertiesPanel
          element={ { id: 'foo', type: 'foo' } }
          headerProvider={ HeaderProvider }
          groups={ groups }
          eventBus={ eventBus }
        />
      );
    });

    // then: group opened and input focused
    const groupEntries = domQuery('.bio-properties-panel-group-entries', container);
    expect(domClasses(groupEntries).has('open')).to.be.true;
    expect(tracker.focusedIds).to.include('foo');
  });


  it('should reveal entry without focusable control without throwing', function() {

    // given
    const groups = [ {
      id: 'g1',
      label: 'Group 1',
      entries: [ { id: 'foo', component: NonFocusableEntry } ]
    } ];

    createPanel({ groups });

    const groupEntries = domQuery('.bio-properties-panel-group-entries', container);

    // when
    expect(function() {
      act(() => eventBus.fire('propertiesPanel.showEntry', { id: 'foo' }));
    }).not.to.throw();

    // then: group opened, no exception
    expect(domClasses(groupEntries).has('open')).to.be.true;
  });


  it('should not throw for unknown entry id', function() {

    // given
    const groups = [ {
      id: 'g1',
      label: 'Group 1',
      entries: [ { id: 'foo', component: FocusableEntry } ]
    } ];

    createPanel({ groups });

    const groupEntries = domQuery('.bio-properties-panel-group-entries', container);

    // when
    expect(function() {
      act(() => eventBus.fire('propertiesPanel.showEntry', { id: 'does-not-exist' }));
    }).not.to.throw();

    // then: no group opened, no focus change
    expect(domClasses(groupEntries).has('open')).to.be.false;
    expect(tracker.focusedIds).to.be.empty;
  });


  it('should focus entry when element change and showEntry are batched', function() {

    // simulates camunda/linting: select(element) then fire('showEntry')
    // synchronously within the same handler — both updates land in the
    // same React batch, so the new render has both the new element and
    // the pending request

    // given (no groups for element A)
    const { rerender } = createPanel({
      element: { id: 'a', type: 'a' },
      groups: []
    });

    const groups = [ {
      id: 'g1',
      label: 'Group 1',
      entries: [ { id: 'foo', component: FocusableEntry } ]
    } ];

    // when: element change to B and showEntry are batched together
    act(() => {
      rerender(
        <PropertiesPanel
          element={ { id: 'b', type: 'b' } }
          headerProvider={ HeaderProvider }
          groups={ groups }
          eventBus={ eventBus }
        />
      );
      eventBus.fire('propertiesPanel.showEntry', { id: 'foo' });
    });

    // then: group on the new element opened and entry focused
    const groupEntries = domQuery('.bio-properties-panel-group-entries', container);
    expect(domClasses(groupEntries).has('open')).to.be.true;
    expect(tracker.focusedIds).to.include('foo');
  });


  it('should cancel pending request when element changes', function() {

    // given (no groups — entry not mounted yet)
    const { rerender } = createPanel({
      element: { id: 'a', type: 'a' },
      groups: []
    });

    // when: event fires for element A
    act(() => eventBus.fire('propertiesPanel.showEntry', { id: 'foo' }));

    // and: element changes to B before 'foo' is ever mounted
    act(() => {
      rerender(
        <PropertiesPanel
          element={ { id: 'b', type: 'b' } }
          headerProvider={ HeaderProvider }
          groups={ [] }
          eventBus={ eventBus }
        />
      );
    });

    // and: element B's groups render with entry 'foo'
    const groups = [ {
      id: 'g1',
      label: 'Group 1',
      entries: [ { id: 'foo', component: FocusableEntry } ]
    } ];

    act(() => {
      rerender(
        <PropertiesPanel
          element={ { id: 'b', type: 'b' } }
          headerProvider={ HeaderProvider }
          groups={ groups }
          eventBus={ eventBus }
        />
      );
    });

    // then: pending was cancelled; group stays closed; no focus
    const groupEntries = domQuery('.bio-properties-panel-group-entries', container);
    expect(domClasses(groupEntries).has('open')).to.be.false;
    expect(tracker.focusedIds).to.be.empty;
  });


  it('should honor the last request when called rapidly in succession', function() {

    // given
    const groups = [ {
      id: 'g1',
      label: 'Group 1',
      shouldOpen: true,
      entries: [
        { id: 'foo', component: FocusableEntry },
        { id: 'bar', component: FocusableEntry }
      ]
    } ];

    createPanel({ groups });

    // when
    act(() => {
      eventBus.fire('propertiesPanel.showEntry', { id: 'foo' });
      eventBus.fire('propertiesPanel.showEntry', { id: 'bar' });
    });

    // then: last one wins (bar was focused last, after foo)
    expect(tracker.lastFocusedId).to.equal('bar');
  });


  it('should preserve data-entry-id on all entries (regression)', function() {

    // given
    const groups = [ {
      id: 'g1',
      label: 'Group 1',
      shouldOpen: true,
      entries: [
        { id: 'foo', component: FocusableEntry },
        { id: 'bar', component: NonFocusableEntry }
      ]
    } ];

    createPanel({ groups });

    // then
    expect(domQuery('[data-entry-id="foo"]', container)).to.exist;
    expect(domQuery('[data-entry-id="bar"]', container)).to.exist;
  });


  it('should still work via legacy useShowEntryEvent hook (backward compatibility)', function() {

    // given: useShowEntryEvent subscribes directly to the event bus too;
    // verify the legacy path still triggers onShow when the hook is used
    // outside of a <PropertiesPanel> (only EventContext in scope)
    const groups = [ {
      id: 'g1',
      label: 'Group 1',
      shouldOpen: true,
      entries: [ { id: 'foo', component: FocusableEntry } ]
    } ];

    const onFireSpy = sinonSpy();
    eventBus.on('propertiesPanel.showEntry', onFireSpy);

    createPanel({ groups });

    // when
    act(() => eventBus.fire('propertiesPanel.showEntry', { id: 'foo' }));

    // then: event bus still receives the event, coordinator picks it up
    expect(onFireSpy).to.have.been.called;
    expect(tracker.focusedIds).to.include('foo');
  });

});

