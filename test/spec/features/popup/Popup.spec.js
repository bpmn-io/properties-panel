import { expect } from 'chai';

import {
  spy as sinonSpy,
  match as sinonMatch
} from 'sinon';

import { act } from '@testing-library/preact';
import { render, cleanup } from '@testing-library/preact/pure';

import MochaTestContainer from 'mocha-test-container-support';

import { query as domQuery } from 'min-dom';

import FeelPopupModule from '../../../../src/features/popup';
import PropertiesPanel from '../../../../src/PropertiesPanel';

import {
  Popup,
  PopupBody,
  PopupTitle
} from '../../../../src/features/popup/components';

import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';


describe('Popup', function() {

  let container, panelContainer, panel, layoutConfig, layoutChanged;

  beforeEach(function() {
    container = MochaTestContainer.get(this);

    bootstrapDiagram({
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

    layoutConfig = {};
    layoutChanged = sinonSpy();
    panelContainer = document.createElement('div');
    container.appendChild(panelContainer);
    panel = renderPanel();
  });

  afterEach(function() {
    act(() => getDiagramJS().get('eventBus').fire('propertiesPanel.closePopup'));
    cleanup();
    container.innerHTML = '';
  });

  function renderPanel() {
    return render(
      <PropertiesPanel
        element={ {} }
        groups={ [] }
        eventBus={ getDiagramJS().get('eventBus') }
        layoutConfig={ layoutConfig }
        layoutChanged={ layoutChanged }
      />,
      { container: panelContainer }
    );
  }


  it('should fire <propertiesPanelPopup.open> on <propertiesPanel.openPopup>', inject(function(eventBus) {

    // given
    const spy = sinonSpy();

    eventBus.on('propertiesPanelPopup.open', spy);

    // when
    const isPopupOpen = eventBus.fire('propertiesPanel.openPopup', DEFAULT_OPEN_POPUP_EVENT);

    // then
    expect(isPopupOpen).to.be.true;

    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith(sinonMatch({
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
    const spy = sinonSpy();

    eventBus.on('propertiesPanelPopup.close', spy);

    eventBus.fire('propertiesPanel.openPopup', DEFAULT_OPEN_POPUP_EVENT);

    // when
    eventBus.fire('propertiesPanel.closePopup');

    // then
    expect(spy).to.have.been.calledOnce;
  }));


  it('should not fire <propertiesPanelPopup.close> on <propertiesPanel.closePopup>', inject(function(eventBus) {

    // given
    const spy = sinonSpy();

    eventBus.on('propertiesPanelPopup.close', spy);

    // when
    eventBus.fire('propertiesPanel.closePopup');

    // then
    expect(spy).not.to.have.been.called;
  }));


  it('should fire <propertiesPanelPopup.close> on <propertiesPanel.detach>', inject(function(eventBus) {

    // given
    const spy = sinonSpy();

    eventBus.on('propertiesPanelPopup.close', spy);

    eventBus.fire('propertiesPanel.openPopup', DEFAULT_OPEN_POPUP_EVENT);

    // when
    eventBus.fire('propertiesPanel.detach');

    // then
    expect(spy).to.have.been.calledOnce;
  }));


  it('should not fire <propertiesPanelPopup.close> on <propertiesPanel.detach>', inject(function(eventBus) {

    // given
    const spy = sinonSpy();

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
        const spy = sinonSpy();

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
      const openSpy = sinonSpy();
      const openedSpy = sinonSpy();

      eventBus.on('feelPopup.open', openSpy);
      eventBus.on('feelPopup.opened', openedSpy);

      // assume
      expect(getPopup(container)).to.not.exist;

      // when
      await openPopup();

      // then
      expect(openSpy).to.have.been.calledOnce;
      expect(openedSpy).to.have.been.calledOnce;
      expect(openedSpy).to.have.been.calledWith(sinonMatch.has('domNode'));
    }));


    it('should listen on <feelPopup.closed>', inject(async function(eventBus) {

      // given
      const closeSpy = sinonSpy();
      const closedSpy = sinonSpy();

      eventBus.on('feelPopup.close', closeSpy);
      eventBus.on('feelPopup.closed', closedSpy);

      // assume
      expect(getPopup(container)).to.not.exist;

      // when
      await openPopup();

      await closePopup();

      // then
      expect(closeSpy).to.have.been.calledOnce;
      expect(closeSpy).to.have.been.calledWith(sinonMatch.has('domNode'));
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
      const spy = sinonSpy();
      eventBus.on('propertiesPanelPopup.open', spy);

      const openConfig = {
        type: 'feel'
      };
      const sourceElement = document.createElement('input');

      // when
      feelPopup.open('testEntry', openConfig, sourceElement);

      // then
      expect(spy).to.have.been.calledOnce;
      expect(spy).to.have.been.calledWith(sinonMatch({
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
      const spy = sinonSpy();
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
      const spy = sinonSpy();
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


  describe('popup layout', function() {

    const layout = {
      size: { width: 450, height: 300 },
      position: { top: 25, left: 35 }
    };

    it('should restore size and position from configuration', async function() {

      // given
      layoutConfig = { popups: { text: layout } };
      renderPanel();

      // when
      await openPopup({ entryId: 'foo', type: 'text' });

      // then
      const popup = domQuery('.bio-properties-panel-popup', container);
      expect(popup.style.width).to.equal('450px');
      expect(popup.style.height).to.equal('300px');
      expect(popup.style.top).to.equal('25px');
      expect(popup.style.left).to.equal('35px');
    });


    [ 'feel', 'feelers', 'text' ].forEach(type => {

      it(`should save ${type} size and position on close`, inject(async function() {

        // given
        await openPopup({ entryId: 'foo', type });
        const popup = domQuery('.bio-properties-panel-popup', container);
        Object.assign(popup.style, {
          width: '450px', height: '300px', top: '25px', left: '35px'
        });
        layoutChanged.resetHistory();

        // when
        await closePopup();

        // then
        expect(layoutChanged).to.have.been.calledOnceWith({ popups: { [type]: layout } });
      }));


      it(`should restore ${type} size and position`, inject(async function() {

        // given
        layoutConfig = { popups: { [type]: layout } };
        renderPanel();

        // when
        await openPopup({ entryId: 'foo', type });

        // then
        const popup = domQuery('.bio-properties-panel-popup', container);
        expect(popup.style.width).to.equal('450px');
        expect(popup.style.height).to.equal('300px');
        expect(popup.style.top).to.equal('25px');
        expect(popup.style.left).to.equal('35px');
      }));

    });


    it('should remember size and position through layout state', inject(async function() {

      // given
      await openPopup({ entryId: 'foo', type: 'text' });
      Object.assign(domQuery('.bio-properties-panel-popup', container).style, {
        width: '450px', height: '300px', top: '25px', left: '35px'
      });
      await closePopup();

      // when
      await openPopup({ entryId: 'bar', type: 'text' });

      // then
      const popup = domQuery('.bio-properties-panel-popup', container);
      expect(popup.style.width).to.equal('450px');
      expect(popup.style.height).to.equal('300px');
      expect(popup.style.top).to.equal('25px');
      expect(popup.style.left).to.equal('35px');
    }));


    it('should save size and position before immediate panel unmount', inject(async function(eventBus) {

      // given
      await openPopup({ entryId: 'foo', type: 'text', ...layout.size, position: layout.position });
      layoutChanged.resetHistory();

      // when
      act(() => {
        eventBus.fire('propertiesPanel.detach');
        panel.unmount();
      });

      // then
      expect(layoutChanged).to.have.been.calledOnceWith({ popups: { text: layout } });
    }));


    it('should retain group layout and other popup sizes when switching types', inject(async function() {

      // given
      layoutConfig = { groups: { foo: { open: true } } };
      renderPanel();
      await openPopup({ entryId: 'foo', type: 'feel', ...layout.size, position: layout.position });
      layoutChanged.resetHistory();

      // when
      await openPopup({ entryId: 'bar', type: 'text', width: 500, height: 250 });
      await closePopup();

      // then
      const savedLayout = layoutChanged.lastCall.args[0];
      expect(savedLayout.groups).to.eql({ foo: { open: true } });
      expect(savedLayout.popups.feel).to.eql(layout);
      expect(savedLayout.popups.text.size).to.eql({ width: 500, height: 250 });
    }));


    it('should save into the latest layout after an external update', inject(async function() {

      // given
      await openPopup({ entryId: 'foo', type: 'text', ...layout.size, position: layout.position });
      layoutConfig = { groups: { foo: { open: true } } };
      renderPanel();
      layoutChanged.resetHistory();

      // when
      await closePopup();

      // then
      expect(layoutChanged).to.have.been.calledOnceWith({
        groups: { foo: { open: true } },
        popups: { text: layout }
      });
    }));


    it('should keep popup types independent', inject(async function() {

      // given
      layoutConfig = { popups: { feel: layout } };
      renderPanel();

      // when
      await openPopup({ entryId: 'foo', type: 'text' });

      // then
      const popup = domQuery('.bio-properties-panel-popup', container);
      expect(popup.style.width).to.equal('700px');
      expect(popup.style.height).to.equal('400px');
    }));


    it('should respect explicit size and position when opening', inject(async function() {

      // given
      layoutConfig = { popups: { text: layout } };
      renderPanel();

      // when
      await openPopup({
        entryId: 'foo', type: 'text',
        width: 500, height: 350, position: { top: 40, left: 50 }
      });

      // then
      const popup = domQuery('.bio-properties-panel-popup', container);
      expect(popup.style.width).to.equal('500px');
      expect(popup.style.height).to.equal('350px');
      expect(popup.style.top).to.equal('40px');
      expect(popup.style.left).to.equal('50px');
    }));


    it('should forward size and position to a custom provider', inject(async function(eventBus, feelPopup) {

      // given
      function CustomPopup({ width = 500, height = 350, position, onClose }) {
        return <Popup width={ width } height={ height } position={ position } onClose={ onClose } />;
      }
      feelPopup.registerProvider('custom', CustomPopup);
      layoutConfig = { popups: { custom: layout } };
      renderPanel();

      // when
      await openPopup({ entryId: 'foo', type: 'custom' });

      // then
      const popup = domQuery('.bio-properties-panel-popup', container);
      expect(popup.style.width).to.equal('450px');
      expect(popup.style.height).to.equal('300px');
      expect(popup.style.top).to.equal('25px');
      expect(popup.style.left).to.equal('35px');
    }));


    [ 'propertiesPanel.detach', 'diagram.destroy' ].forEach(event => {

      it(`should save size and position on ${event}`, inject(async function(eventBus) {

        // given
        await openPopup({ entryId: 'foo', type: 'text', ...layout.size, position: layout.position });
        layoutChanged.resetHistory();

        // when
        act(() => eventBus.fire(event));

        // then
        expect(layoutChanged).to.have.been.calledOnceWith({ popups: { text: layout } });
        expect(domQuery('.bio-properties-panel-popup', container)).not.to.exist;
      }));

    });
  });


  describe('providers', function() {

    it('should render a registered custom provider', inject(function(eventBus, feelPopup) {

      // given
      function CustomPopup(props) {
        return <div class="custom-popup">{ props.value }</div>;
      }

      feelPopup.registerProvider('custom', CustomPopup);

      // when
      act(() => {
        eventBus.fire('propertiesPanel.openPopup', {
          entryId: 'foo',
          type: 'custom',
          value: 'hello world'
        });


      });

      // then
      const popup = domQuery('.custom-popup', container);

      expect(popup).to.exist;
      expect(popup.textContent).to.equal('hello world');
    }));


    it('should render a provider composed of the popup components', inject(function(eventBus, feelPopup) {

      // given
      function CustomPopup(props) {
        return (
          <Popup title={ props.title } onClose={ props.onClose }>
            <PopupTitle title={ props.title } showCloseButton onClose={ props.onClose } draggable />
            <PopupBody className="custom-popup-body">{ props.value }</PopupBody>
          </Popup>
        );
      }

      feelPopup.registerProvider('custom', CustomPopup);

      // when
      act(() => {
        eventBus.fire('propertiesPanel.openPopup', {
          entryId: 'foo',
          type: 'custom',
          label: 'Custom',
          value: 'hello world'
        });
      });

      // then
      expect(domQuery('.bio-properties-panel-popup', container)).to.exist;
      expect(domQuery('.bio-properties-panel-popup__header.draggable', container)).to.exist;
      expect(domQuery('.bio-properties-panel-popup__close', container)).to.exist;
      expect(domQuery('.custom-popup-body', container).textContent).to.equal('hello world');
    }));


    it('should center the popup based on its own size', inject(function(eventBus, feelPopup) {

      // given
      const width = 900, height = 640;

      function CustomPopup(props) {
        return <Popup title={ props.title } onClose={ props.onClose } width={ width } height={ height } />;
      }

      feelPopup.registerProvider('custom', CustomPopup);

      // when
      act(() => {
        eventBus.fire('propertiesPanel.openPopup', {
          entryId: 'foo',
          type: 'custom'
        });
      });

      // then
      const popup = domQuery('.bio-properties-panel-popup', container);

      expect(popup.style.left).to.equal(`${ Math.max(0, (window.innerWidth - width) / 2) }px`);
      expect(popup.style.top).to.equal(`${ Math.max(0, (window.innerHeight - height) / 2) }px`);
    }));


    it('should close a provider composed of the popup components', inject(function(eventBus, feelPopup) {

      // given
      function CustomPopup(props) {
        return (
          <Popup title={ props.title } onClose={ props.onClose }>
            <PopupTitle title={ props.title } showCloseButton onClose={ props.onClose } />
          </Popup>
        );
      }

      feelPopup.registerProvider('custom', CustomPopup);

      act(() => {
        eventBus.fire('propertiesPanel.openPopup', {
          entryId: 'foo',
          type: 'custom'
        });
      });

      // when
      act(() => domQuery('.bio-properties-panel-popup__close', container).click());

      // then
      expect(feelPopup.isOpen()).to.be.false;
      expect(domQuery('.bio-properties-panel-popup', container)).not.to.exist;
    }));


    it('should default to the text popup when no type is given', inject(function(eventBus) {

      // when
      act(() => {
        eventBus.fire('propertiesPanel.openPopup', {
          entryId: 'foo',
          value: 'plain'
        });
      });

      // then
      expect(domQuery('.bio-properties-panel-text-popup', container)).to.exist;
    }));


    it('should override a built-in provider (default priority beats built-in)', inject(function(eventBus, feelPopup) {

      // given
      function CustomTextPopup(props) {
        return <div class="custom-text-popup">{ props.value }</div>;
      }

      feelPopup.registerProvider('text', CustomTextPopup);

      // when
      act(() => {
        eventBus.fire('propertiesPanel.openPopup', {
          entryId: 'foo',
          type: 'text',
          value: 'hello world'
        });
      });

      // then
      expect(domQuery('.custom-text-popup', container)).to.exist;
      expect(domQuery('.bio-properties-panel-text-popup', container)).not.to.exist;
    }));


    it('should respect provider priority', inject(function(eventBus, feelPopup) {

      // given
      function LowPopup() {
        return <div class="low-popup" />;
      }

      function HighPopup() {
        return <div class="high-popup" />;
      }

      feelPopup.registerProvider('text', 900, LowPopup);
      feelPopup.registerProvider('text', 1100, HighPopup);

      // when
      act(() => {
        eventBus.fire('propertiesPanel.openPopup', {
          entryId: 'foo',
          type: 'text',
          value: 'hello world'
        });
      });

      // then
      expect(domQuery('.high-popup', container)).to.exist;
      expect(domQuery('.low-popup', container)).not.to.exist;
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
