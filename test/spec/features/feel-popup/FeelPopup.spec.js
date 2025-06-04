import { act } from '@testing-library/preact';
import MochaTestContainer from 'mocha-test-container-support';

import { query as domQuery } from 'min-dom';

import FeelPopupModule from '../../../../src/features/feel-popup';

import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';


describe('FeelPopup', function() {

  let container;

  beforeEach(function() {
    container = MochaTestContainer.get(this);

    return bootstrapDiagram({
      modules: [ FeelPopupModule ],
      propertiesPanel: {
        feelPopupContainer: container,
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
    })();
  });

  afterEach(function() {
    container.innerHTML = '';
  });


  it('should fire <propertiesPanelPopup.open> on <propertiesPanel.openPopup>', inject(function(eventBus) {

    // given
    const spy = sinon.spy();

    eventBus.on('propertiesPanelPopup.open', spy);

    // when
    const isPopupOpen = eventBus.fire('propertiesPanel.openPopup', DEFAULT_OPEN_POPUP_EVENT);

    // then
    expect(isPopupOpen).to.be.true;

    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith(sinon.match({
      container: container,
      config: {
        entryId: 'foo',
        links: [
          { href: 'https://foo.com', title: 'Foo' },
          { href: 'https://bar.com', title: 'Bar' }
        ],
        type: 'feel',
      }
    }));
  }));


  it('should fire <propertiesPanelPopup.close> on <propertiesPanel.closePopup>', inject(function(eventBus) {

    // given
    const spy = sinon.spy();

    eventBus.on('propertiesPanelPopup.close', spy);

    eventBus.fire('propertiesPanel.openPopup', DEFAULT_OPEN_POPUP_EVENT);

    // when
    eventBus.fire('propertiesPanel.closePopup');

    // then
    expect(spy).to.have.been.calledOnce;
  }));


  it('should not fire <propertiesPanelPopup.close> on <propertiesPanel.closePopup>', inject(function(eventBus) {

    // given
    const spy = sinon.spy();

    eventBus.on('propertiesPanelPopup.close', spy);

    // when
    eventBus.fire('propertiesPanel.closePopup');

    // then
    expect(spy).not.to.have.been.called;
  }));


  it('should fire <propertiesPanelPopup.close> on <propertiesPanel.detach>', inject(function(eventBus) {

    // given
    const spy = sinon.spy();

    eventBus.on('propertiesPanelPopup.close', spy);

    eventBus.fire('propertiesPanel.openPopup', DEFAULT_OPEN_POPUP_EVENT);

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


  describe('lifecycle events', function() {

    function expectDraggingEvent(event) {

      it('should listen on <' + event + '>', inject(async function(eventBus) {

        // given
        const spy = sinon.spy();

        eventBus.on(event, spy);

        // when
        await openPopup();

        const header = domQuery('.bio-properties-panel-popup__header', container);
        const dragger = domQuery('.bio-properties-panel-popup__drag-handle', header);
        const draggerBounds = dragger.getBoundingClientRect();

        // when
        startDragging(dragger);
        moveDragging(dragger, { clientX: draggerBounds.x + 20, clientY: draggerBounds.y });
        endDragging(dragger);

        // then
        expect(spy).to.have.been.calledOnce;
      }));
    }


    it('should listen on <feelPopup.opened>', inject(async function(eventBus) {

      // given
      const openSpy = sinon.spy();
      const openedSpy = sinon.spy();

      eventBus.on('feelPopup.open', openSpy);
      eventBus.on('feelPopup.opened', openedSpy);

      // assume
      expect(getPopup(container)).to.not.exist;

      // when
      await openPopup();

      // then
      expect(openSpy).to.have.been.calledOnce;
      expect(openedSpy).to.have.been.calledOnce;
      expect(openedSpy).to.have.been.calledWith(sinon.match.has('domNode'));
    }));


    it('should listen on <feelPopup.closed>', inject(async function(eventBus) {

      // given
      const closeSpy = sinon.spy();
      const closedSpy = sinon.spy();

      eventBus.on('feelPopup.close', closeSpy);
      eventBus.on('feelPopup.closed', closedSpy);

      // assume
      expect(getPopup(container)).to.not.exist;

      // when
      await openPopup();

      await closePopup();

      // then
      expect(closeSpy).to.have.been.calledOnce;
      expect(closeSpy).to.have.been.calledWith(sinon.match.has('domNode'));
      expect(closedSpy).to.have.been.calledOnce;
    }));


    it('lifecycle events', inject(async function(eventBus) {

      // given

      // List of lifecycle events and expected popup visibility
      const expectedEvents = [
        [ 'feelPopup.open', false ],
        [ 'feelPopup.opened', true ],
        [ 'feelPopup.close', true ],
        [ 'feelPopup.closed', false ]
      ];

      const firedEvents = [];
      expectedEvents.forEach(([ eventName ]) => {

        // Track fired events and wether the popup is visible at the time
        eventBus.on(eventName , () =>{
          firedEvents.push([ eventName, !!getPopup(container) ]);
        });
      });

      // when
      await openPopup();

      await closePopup();

      // then
      expect(firedEvents).to.eql(expectedEvents);
    }));


    expectDraggingEvent('feelPopup.dragstart');


    expectDraggingEvent('feelPopup.dragover');


    expectDraggingEvent('feelPopup.dragend');
  });


  describe('service', function() {

    it('#open should fire <propertiesPanelPopup.open>', inject(function(eventBus, feelPopup) {

      // given
      const spy = sinon.spy();
      eventBus.on('propertiesPanelPopup.open', spy);

      const openConfig = {
        type: 'feel'
      };
      const sourceElement = document.createElement('input');

      // when
      feelPopup.open('testEntry', openConfig, sourceElement);

      // then
      expect(spy).to.have.been.calledOnce;
      expect(spy).to.have.been.calledWith(sinon.match({
        container: container,
        config: {
          entryId: 'testEntry',
          type: 'feel',
          sourceElement,
          links: [
            { href: 'https://foo.com', title: 'Foo' },
            { href: 'https://bar.com', title: 'Bar' }
          ]
        }
      }));
    }));


    it('#close should fire <propertiesPanelPopup.close> if popup is open', inject(function(eventBus, feelPopup) {

      // given
      const spy = sinon.spy();
      eventBus.on('propertiesPanelPopup.close', spy);

      // open popup first
      feelPopup.open('testEntry', { type: 'feel' }, document.createElement('input'));

      // when
      feelPopup.close();

      // then
      expect(spy).to.have.been.calledOnce;
    }));


    it('#close should NOT fire <propertiesPanelPopup.close> if popup is NOT open', inject(function(eventBus, feelPopup) {

      // given
      const spy = sinon.spy();
      eventBus.on('propertiesPanelPopup.close', spy);

      // when
      feelPopup.close();

      // then
      expect(spy).not.to.have.been.called;
    }));


    it('#isOpen should return correct state', inject(function(feelPopup) {

      // assume
      expect(feelPopup.isOpen()).to.be.false;

      // when
      feelPopup.open('testEntry', { type: 'feel' }, document.createElement('input'));

      // then
      expect(feelPopup.isOpen()).to.be.true;

      // when
      feelPopup.close();

      // then
      expect(feelPopup.isOpen()).to.be.false;
    }));

  });
});

const DEFAULT_OPEN_POPUP_EVENT = {
  entryId: 'foo',
  type: 'feel'
};

function openPopup(context = DEFAULT_OPEN_POPUP_EVENT) {
  return act(() => {
    return getDiagramJS().get('eventBus').fire('propertiesPanel.openPopup', context);
  });
}

function closePopup() {
  return act(() => {
    return getDiagramJS().get('eventBus').fire('propertiesPanel.closePopup');
  });
}

function getPopup(container) {
  return domQuery('.bio-properties-panel-feel-popup', container);
}

function dispatchEvent(element, type, options = {}) {
  const event = document.createEvent('Event');

  event.initEvent(type, true, true);

  Object.keys(options).forEach(key => event[ key ] = options[ key ]);

  element.dispatchEvent(event);
}

function startDragging(node, position) {
  if (!position) {
    const bounds = node.getBoundingClientRect();
    position = {
      clientX: bounds.x,
      clientY: bounds.y
    };
  }

  dispatchEvent(node, 'dragstart', position);
}

function moveDragging(node, position) {
  if (!position) {
    const bounds = node.getBoundingClientRect();
    position = {
      clientX: bounds.x + 20,
      clientY: bounds.y + 20
    };
  }

  dispatchEvent(node, 'dragover', position);
}

function endDragging(node) {
  dispatchEvent(node, 'dragend');
}
