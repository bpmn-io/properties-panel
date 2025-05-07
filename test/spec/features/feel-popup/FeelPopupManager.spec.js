import { FeelPopupManager } from '../../../../src/features/feel-popup/FeelPopupManager';

describe('FeelPopupManager', function() {
  let feelPopupManager;
  let eventBusMock;
  let onSpy;
  let fireSpy;
  let baseContext;

  beforeEach(function() {
    onSpy = sinon.spy();
    fireSpy = sinon.spy();

    eventBusMock = {
      on: onSpy,
      fire: fireSpy
    };

    feelPopupManager = new FeelPopupManager(eventBusMock);

    baseContext = {
      type: 'feel',
      value: 'expression value',
      variables: [],
      onInput: () => {},
      element: { id: 'elem1' },
      label: 'Expression Label',
      sourceField: document.createElement('input'),
      sourceFieldContainer: document.createElement('div'),
      popupContainer: document.createElement('div'),
      getLinks: (type) => [ { href: 'docs.com', title: 'Docs' } ]
    };
  });

  function createExpandEntryEvent(entryId = 'entry1', contextOverrides = {}) {
    return {
      entryId,
      context: {
        ...baseContext,
        ...contextOverrides
      }
    };
  }

  it('should subscribe to events on initialization', function() {

    // then
    expect(onSpy.calledWith('propertiesPanel.expandEntry')).to.be.true;
    expect(onSpy.calledWith('propertiesPanel.unmountedEntry')).to.be.true;
    expect(onSpy.calledWith('propertiesPanel.detach')).to.be.true;
  });

  describe('openPopup', function() {
    it('should fire popup open event', function() {

      // given
      const expandEntryEvent = createExpandEntryEvent();

      // when
      feelPopupManager.openPopup(expandEntryEvent);

      // then
      expect(fireSpy.calledWith('propertiesPanelPopup.open')).to.be.true;
      expect(fireSpy.calledWith('propertiesPanel.setExpandedEntries')).to.be.true;
      expect(feelPopupManager.getActivePopupEntryId()).to.equal('entry1');
    });

    it('should fire popup update event if reopening same popup', function() {

      // given
      const expandEntryEvent = createExpandEntryEvent();

      feelPopupManager.openPopup(expandEntryEvent);
      fireSpy.resetHistory();

      // when
      feelPopupManager.openPopup(expandEntryEvent);

      // then
      expect(fireSpy.calledWith('propertiesPanelPopup.update')).to.be.true;
      expect(fireSpy.calledWith('propertiesPanelPopup.open')).to.be.false;
      expect(feelPopupManager.getActivePopupEntryId()).to.equal('entry1');
    });

    it('should close existing popup when opening a new one', function() {

      // given
      const firstExpandEntryEvent = createExpandEntryEvent('entry1', {
        label: 'Label 1',
        value: 'value1'
      });

      const secondExpandEntryEvent = createExpandEntryEvent('entry2', {
        label: 'Label 2',
        value: 'value2'
      });

      feelPopupManager.openPopup(firstExpandEntryEvent);
      fireSpy.resetHistory();

      // when
      feelPopupManager.openPopup(secondExpandEntryEvent);

      // then
      expect(fireSpy.calledWith('propertiesPanelPopup.close')).to.be.true;
      expect(fireSpy.calledWith('propertiesPanelPopup.open')).to.be.true;
      expect(feelPopupManager.getActivePopupEntryId()).to.equal('entry2');
    });

    it('should include properly formatted context in the open event', function() {

      // given
      const expandEntryEvent = createExpandEntryEvent('entry1', {
        variables: [ { name: 'var1', value: 'val1' } ]
      });

      // when
      feelPopupManager.openPopup(expandEntryEvent);

      // then
      const openEventCall = fireSpy.args.find(call => call[0] === 'propertiesPanelPopup.open');
      expect(openEventCall).to.exist;

      const openEventPayload = openEventCall[1];
      expect(openEventPayload).to.have.property('entryId', 'entry1');
      expect(openEventPayload).to.have.property('context');

      const context = openEventPayload.context;
      expect(context).to.have.property('type', 'feel');
      expect(context).to.have.property('value', 'expression value');
      expect(context).to.have.property('variables').that.deep.equals([ { name: 'var1', value: 'val1' } ]);
      expect(context).to.have.property('title').that.is.a('string');
      expect(context).to.have.property('links').that.deep.equals([ { href: 'docs.com', title: 'Docs' } ]);
      expect(context).to.have.property('position').that.is.an('object');
      expect(context).to.have.property('onClose').that.is.a('function');
    });

    it('should include properly formatted context in the update event', function() {

      // given
      const expandEntryEvent = createExpandEntryEvent('entry1', {
        value: 'initial value'
      });

      feelPopupManager.openPopup(expandEntryEvent);

      const updatedEvent = createExpandEntryEvent('entry1', {
        value: 'updated value'
      });

      fireSpy.resetHistory();

      // when
      feelPopupManager.openPopup(updatedEvent);

      // then
      const updateEventCall = fireSpy.args.find(call => call[0] === 'propertiesPanelPopup.update');
      expect(updateEventCall).to.exist;

      const updateEventPayload = updateEventCall[1];
      expect(updateEventPayload.context).to.have.property('value', 'updated value');
    });

    it('should provide a functional onClose handler in the context', function() {

      // given
      const sourceField = document.createElement('input');
      const focusSpy = sinon.spy(sourceField, 'focus');

      const expandEntryEvent = createExpandEntryEvent('entry1', {
        sourceField: sourceField
      });

      feelPopupManager.openPopup(expandEntryEvent);

      const openEventCall = fireSpy.args.find(call => call[0] === 'propertiesPanelPopup.open');
      const onClose = openEventCall[1].context.onClose;

      fireSpy.resetHistory();
      const clock = sinon.useFakeTimers();

      // when
      onClose();

      // then
      expect(fireSpy.calledWith('propertiesPanelPopup.close')).to.be.true;
      clock.tick(10);

      // then
      expect(focusSpy.calledOnce).to.be.true;

      // cleanup
      clock.restore();
      focusSpy.restore();
    });
  });

  describe('closePopup', function() {
    it('should close active popup', function() {

      // given
      const expandEntryEvent = createExpandEntryEvent();

      feelPopupManager.openPopup(expandEntryEvent);
      fireSpy.resetHistory();

      // when
      feelPopupManager.closePopup('entry1');

      // then
      expect(fireSpy.calledWith('propertiesPanelPopup.close')).to.be.true;
      expect(fireSpy.calledWith('propertiesPanel.setExpandedEntries')).to.be.true;
      expect(feelPopupManager.getActivePopupEntryId()).to.be.null;
    });

    it('should warn when attempting to close non-active popup', function() {

      // given
      sinon.stub(console, 'warn');
      const expandEntryEvent = createExpandEntryEvent();

      feelPopupManager.openPopup(expandEntryEvent);

      // when
      feelPopupManager.closePopup('entry2');

      // then
      expect(console.warn.calledOnce).to.be.true;
      expect(feelPopupManager.getActivePopupEntryId()).to.equal('entry1');

      console.warn.restore();
    });

    it('should pass the correct entryId in the close event', function() {

      // given
      const expandEntryEvent = createExpandEntryEvent();

      feelPopupManager.openPopup(expandEntryEvent);
      fireSpy.resetHistory();

      // when
      feelPopupManager.closePopup();

      // then
      const closeEventCall = fireSpy.args.find(call => call[0] === 'propertiesPanelPopup.close');
      expect(closeEventCall).to.exist;
      expect(closeEventCall[1]).to.have.property('entryId', 'entry1');
    });
  });

  describe('Event handlers', function() {
    it('should handle propertiesPanel.unmountedEntry event', function() {

      // given
      const expandEntryEvent = createExpandEntryEvent();

      feelPopupManager.openPopup(expandEntryEvent);
      fireSpy.resetHistory();

      const unmountedEntryHandler = onSpy.args.find(
        call => call[0] === 'propertiesPanel.unmountedEntry'
      )[1];

      // when
      unmountedEntryHandler({ entryId: 'entry1' });

      // then
      expect(fireSpy.calledWith('propertiesPanelPopup.close')).to.be.true;
      expect(feelPopupManager.getActivePopupEntryId()).to.be.null;
    });

    it('should handle propertiesPanel.detach event', function() {

      // given
      const expandEntryEvent = createExpandEntryEvent();

      feelPopupManager.openPopup(expandEntryEvent);
      fireSpy.resetHistory();

      // Extract the detach handler
      const detachHandler = onSpy.args.find(
        call => call[0] === 'propertiesPanel.detach'
      )[1];

      // when
      detachHandler();

      // then
      expect(fireSpy.calledWith('propertiesPanelPopup.close')).to.be.true;
      expect(feelPopupManager.getActivePopupEntryId()).to.be.null;
    });
  });
});