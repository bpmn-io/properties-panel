import FeelPopupModule from '../../../../src/features/feel-popup';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

describe('FeelPopup', function() {

  beforeEach(bootstrapDiagram({
    modules: [ FeelPopupModule ],
    propertiesPanel: {
      feelPopupContainer: '#feelPopupContainer',
      getFeelPopupLinks: (type) => {
        if (type === 'feel') {
          return [
            { href: 'https://foo.com', title: 'Foo' },
            { href: 'https://bar.com', title: 'Bar' }
          ];
        }

        return [];
      }
    }
  }));


  it('should fire <propertiesPanelPopup.open> on <propertiesPanel.expandEntry>', inject(function(eventBus) {

    // given
    const spy = sinon.spy();

    eventBus.on('propertiesPanelPopup.open', spy);

    // when
    const isExpanded = eventBus.fire('propertiesPanel.expandEntry', DEFAULT_EXPAND_ENTRY_EVENT);

    // then
    expect(isExpanded).to.be.true;

    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith(sinon.match({
      container: '#feelPopupContainer',
      props: {
        entryId: 'foo',
        links: [
          { href: 'https://foo.com', title: 'Foo' },
          { href: 'https://bar.com', title: 'Bar' }
        ],
        type: 'feel',
      }
    }));
  }));


  it('should fire <propertiesPanelPopup.close> on <propertiesPanel.unmountedEntry>', inject(function(eventBus) {

    // given
    const spy = sinon.spy();

    eventBus.on('propertiesPanelPopup.close', spy);

    eventBus.fire('propertiesPanel.expandEntry', DEFAULT_EXPAND_ENTRY_EVENT);

    // when
    eventBus.fire('propertiesPanel.unmountedEntry', {
      entryId: 'foo'
    });

    // then
    expect(spy).to.have.been.calledOnce;
  }));


  it('should not fire <propertiesPanelPopup.close> on <propertiesPanel.unmountedEntry>', inject(function(eventBus) {

    // given
    const spy = sinon.spy();

    eventBus.on('propertiesPanelPopup.close', spy);

    eventBus.fire('propertiesPanel.expandEntry', DEFAULT_EXPAND_ENTRY_EVENT);

    // when
    eventBus.fire('propertiesPanel.unmountedEntry', {
      entryId: 'bar'
    });

    // then
    expect(spy).not.to.have.been.called;
  }));


  it('should fire <propertiesPanelPopup.close> on <propertiesPanel.detach>', inject(function(eventBus) {

    // given
    const spy = sinon.spy();

    eventBus.on('propertiesPanelPopup.close', spy);

    eventBus.fire('propertiesPanel.expandEntry', DEFAULT_EXPAND_ENTRY_EVENT);

    // when
    eventBus.fire('propertiesPanel.detach');

    // then
    expect(spy).to.have.been.calledOnce;
  }));


  it('should not fire <propertiesPanelPopup.close> on <propertiesPanel.detach>', inject(function(eventBus) {

    // given
    const spy = sinon.spy();

    eventBus.on('propertiesPanelPopup.close', spy);

    // when
    eventBus.fire('propertiesPanel.detach');

    // then
    expect(spy).not.to.have.been.called;
  }));

});

const DEFAULT_EXPAND_ENTRY_EVENT = {
  props: {
    entryId: 'foo',
    type: 'feel'
  }
};