import { FeelPopupRenderer } from '../../../../src/features/feel-popup/FeelPopupRenderer';
import { queryAll as domQueryAll } from 'min-dom';

describe('FeelPopupRenderer', function() {
  let feelPopupRenderer;
  let eventBusMock;
  let onSpy;

  function countOpenContainers() {
    return domQueryAll('.bio-properties-panel-popup-container', document.body).length;
  }

  beforeEach(function() {
    onSpy = sinon.spy();
    eventBusMock = {
      on: onSpy
    };

    feelPopupRenderer = new FeelPopupRenderer(eventBusMock);

    sinon.spy(feelPopupRenderer, '_renderPopup');
    sinon.spy(feelPopupRenderer, '_removePopup');
  });

  afterEach(function() {

    // Clean up any popups that might have been created
    feelPopupRenderer.getPopups().forEach(entryId => {
      feelPopupRenderer._removePopup(entryId);
    });

    sinon.restore();
  });

  it('should subscribe to events on initialization', function() {

    // then
    expect(onSpy.calledWith([ 'propertiesPanelPopup.open', 'propertiesPanelPopup.update' ])).to.be.true;
    expect(onSpy.calledWith('propertiesPanelPopup.close')).to.be.true;
  });

  describe('_renderPopup', function() {
    it('should create a new container node when rendering a popup for the first time', function() {

      // given
      const popupContext = {
        entryId: 'entry1',
        type: 'feel',
        value: 'value',
        onClose: () => {}
      };

      // when
      feelPopupRenderer._renderPopup('entry1', popupContext);

      // then
      expect(feelPopupRenderer._popupNodes['entry1']).to.exist;
      expect(feelPopupRenderer._popups['entry1']).to.exist;
      expect(feelPopupRenderer._popupNodes['entry1'].classList.contains('bio-properties-panel-popup-container')).to.be.true;
      expect(countOpenContainers()).to.equal(1);
    });

    it('should reuse existing container node when updating a popup', function() {

      // given
      const popupContext = {
        entryId: 'entry1',
        type: 'feel',
        value: 'initial',
        onClose: () => {}
      };

      feelPopupRenderer._renderPopup('entry1', popupContext);
      const initialNode = feelPopupRenderer._popupNodes['entry1'];

      const updatedContext = {
        ...popupContext,
        value: 'updated'
      };

      // when
      feelPopupRenderer._renderPopup('entry1', updatedContext);

      // then
      expect(feelPopupRenderer._popupNodes['entry1']).to.equal(initialNode);
      expect(feelPopupRenderer._popups['entry1'].value).to.equal('updated');
      expect(countOpenContainers()).to.equal(1);
    });

    it('should use specified container when provided', function() {

      // given
      const customContainer = document.createElement('div');
      document.body.appendChild(customContainer);

      const popupContext = {
        entryId: 'entry1',
        type: 'feel',
        value: 'value',
        onClose: () => {},
        popupContainer: customContainer
      };

      // when
      feelPopupRenderer._renderPopup('entry1', popupContext);

      // then
      expect(customContainer.contains(feelPopupRenderer._popupNodes['entry1'])).to.be.true;

      document.body.removeChild(customContainer);
    });

    it('should handle string container selectors', function() {

      // given
      const customContainer = document.createElement('div');
      customContainer.id = 'custom-container';
      document.body.appendChild(customContainer);

      const popupContext = {
        entryId: 'entry1',
        type: 'feel',
        value: 'value',
        onClose: () => {},
        popupContainer: '#custom-container'
      };

      // when
      feelPopupRenderer._renderPopup('entry1', popupContext);

      // then
      expect(customContainer.contains(feelPopupRenderer._popupNodes['entry1'])).to.be.true;

      document.body.removeChild(customContainer);
    });
  });

  describe('_removePopup', function() {
    it('should remove container node and popup data', function() {

      // given
      const popupContext = {
        entryId: 'entry1',
        type: 'feel',
        value: 'value',
        onClose: () => {}
      };

      feelPopupRenderer._renderPopup('entry1', popupContext);

      expect(countOpenContainers()).to.equal(1);

      // when
      feelPopupRenderer._removePopup('entry1');

      // then
      expect(feelPopupRenderer._popupNodes['entry1']).to.not.exist;
      expect(feelPopupRenderer._popups['entry1']).to.not.exist;
      expect(countOpenContainers()).to.equal(0);
    });

    it('should do nothing if popup does not exist', function() {

      // when/then
      expect(() => feelPopupRenderer._removePopup('nonexistent')).to.not.throw();
    });
  });

  describe('getPopups', function() {
    it('should return array of popup entry IDs', function() {

      // given
      feelPopupRenderer._renderPopup('entry1', {
        type: 'feel',
        value: 'value1',
        onClose: () => {}
      });

      feelPopupRenderer._renderPopup('entry2', {
        type: 'feel',
        value: 'value2',
        onClose: () => {}
      });

      // when
      const popups = feelPopupRenderer.getPopups();

      // then
      expect(popups).to.have.length(2);
      expect(popups).to.include('entry1');
      expect(popups).to.include('entry2');
    });

    it('should return empty array when no popups exist', function() {

      // when
      const popups = feelPopupRenderer.getPopups();

      // then
      expect(popups).to.have.length(0);
    });
  });

  describe('Event handling', function() {
    it('should render popup on open event', function() {

      // given
      const openHandler = onSpy.args.find(
        call => call[0][0] === 'propertiesPanelPopup.open'
      )[1];

      // when
      openHandler({
        entryId: 'entry1',
        context: {
          type: 'feel',
          value: 'value',
          onClose: () => {}
        }
      });

      // then
      expect(feelPopupRenderer._renderPopup.called).to.be.true;
      expect(feelPopupRenderer._popupNodes['entry1']).to.exist;
      expect(countOpenContainers()).to.equal(1);
    });

    it('should update popup on update event', function() {

      // given
      const updateHandler = onSpy.args.find(
        call => call[0][0] === 'propertiesPanelPopup.open'
      )[1];

      updateHandler({
        entryId: 'entry1',
        context: {
          type: 'feel',
          value: 'initial',
          onClose: () => {}
        }
      });

      // when
      updateHandler({
        entryId: 'entry1',
        context: {
          type: 'feel',
          value: 'updated',
          onClose: () => {}
        }
      });

      // then
      expect(feelPopupRenderer._renderPopup.calledTwice).to.be.true;
      expect(feelPopupRenderer._popups['entry1'].value).to.equal('updated');
    });

    it('should remove popup on close event', function() {

      // given
      feelPopupRenderer._renderPopup('entry1', {
        type: 'feel',
        value: 'value',
        onClose: () => {}
      });

      expect(countOpenContainers()).to.equal(1);

      const closeHandler = onSpy.args.find(
        call => call[0] === 'propertiesPanelPopup.close'
      )[1];

      // when
      closeHandler({ entryId: 'entry1' });

      // then
      expect(feelPopupRenderer._removePopup.called).to.be.true;
      expect(feelPopupRenderer._popups['entry1']).to.not.exist;
      expect(countOpenContainers()).to.equal(0);
    });
  });
});